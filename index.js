// Importing required packageInfos \\
require('dotenv').config();

const asciiart = require('asciiart-logo');
const cliSelect = require('cli-select');
const chalk = require('chalk');
const SteamUser = require('steam-user');

const packageInfo = require('./package.json');
const games = require('./games.json');
let playing_current_session = false;

// Printing "Steam Idler" Ascii Logo \\
console.log(asciiart({
    name: 'Steam Idler',
    font: 'Standard',
    borderColor: 'grey',
    logoColor: 'lime',
    textColor: 'white',
}).right(`v${packageInfo.version}`).emptyLine().center(packageInfo.description).render());

cliSelect({
    values: games,
    valueRenderer: (value, selected) => {
        if (selected) {
            return chalk.underline(value);
        }

        return value;
    },
}).then((selected) => {
    run({name: selected.value, appid: Number(selected.id)});
});

function run(game) {
    // Creating the client
    const client = new SteamUser();

    client.once('loggedOn', (details, parental) => {
        console.log(`[${chalk.yellow('SYSTEM')}] Connection to Steam established.`);
    });

    client.once('accountInfo', (...data) => {
        console.log(`[${chalk.yellow('SYSTEM')}] Account info received.`);
        console.log(`[${chalk.yellow('SYSTEM')}] Logged in as ${chalk.yellow(data[0])} from ${chalk.yellow(data[1])}.`);

        client.setPersona(SteamUser.EPersonaState.Online);
        console.log(`[${chalk.yellow('SYSTEM')}] Set persona state to ${chalk.blueBright('online')}.`);

        playing_current_session = true;
        client.gamesPlayed([game.appid]);
        console.log(`[${chalk.yellow('SYSTEM')}] Set game to ${chalk.greenBright(game.name)}.`);
    })

    client.on('playingState', (blocked, playingApp) => {
        if (blocked) {
            playing_current_session = false;
        } else {
            if (!playing_current_session) {
                playing_current_session = true;

                client.gamesPlayed([game.appid]);
                console.log(`[${chalk.yellow('SYSTEM')}] Relaunched ${chalk.greenBright(game.name)}.`);
            }
        }
    })

    client.on('error', error => {
        if (error.eresult === 6) {
            console.log(`[${chalk.yellow('SYSTEM')}] Logged in elsewhere. Waiting to relaunch game...`);

            client.logOn({
                accountName: process.env.STEAM_USERNAME,
                password: process.env.STEAM_PASSWORD,
                rememberPassword: true,
                autoRelogin: true
            })
        } else {
            console.log(`[${chalk.yellow('SYSTEM')}] Error: ${error.error}`);
        }
    });

    client.on('disconnected', () => {
        console.log(`[${chalk.yellow('SYSTEM')}] Disconnected from Steam.`);
    })

    client.on('steamGuard', function (domain, callback) {
        const readlineSync = require('readline-sync');
        const authCode = readlineSync.question(`[${chalk.yellow('SYSTEM')}] Steam Guard Code: `);
        callback(authCode);
    });

    client.logOn({
        accountName: process.env.STEAM_USERNAME,
        password: process.env.STEAM_PASSWORD,
        rememberPassword: true,
        autoRelogin: true
    })
}
