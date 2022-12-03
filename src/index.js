// Importing required packages \\
require('dotenv').config();

const asciiart = require('asciiart-logo');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const chalk = require('chalk');
const SteamUser = require('steam-user');

const packageInfo = require('../package.json');
let playing_current_session = false;

// Printing "Steam Idler" Ascii Logo \\
console.log(asciiart({
    name: 'Steam Idler',
    font: 'Standard',
    borderColor: 'grey',
    logoColor: 'lime',
    textColor: 'white',
}).right(`v${packageInfo.version}`).emptyLine().center(packageInfo.description).render());

readline.question(`[${chalk.yellow('SYSTEM')}] Enter the application ID(s) you want to start playing, separated by a comma: `, gameId => {
    run(gameId.split(' ').join('').split(',').map(gameId => Number(gameId)));
})

function run(appIds) {
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
        client.gamesPlayed(appIds);
        console.log(`[${chalk.yellow('SYSTEM')}] Set game to ${chalk.greenBright(appIds.join(', '))}.`);
    })

    client.on('playingState', (blocked, playingApp) => {
        if (blocked) {
            playing_current_session = false;
        } else {
            if (!playing_current_session) {
                playing_current_session = true;

                client.gamesPlayed(appIds);
                console.log(`[${chalk.yellow('SYSTEM')}] Relaunched ${chalk.greenBright(appIds)}.`);
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
            console.log(`[${chalk.yellow('SYSTEM')}] ${chalk.red(error)}`);
            process.exit(1);
        }
    });

    client.on('disconnected', () => {
        console.log(`[${chalk.yellow('SYSTEM')}] Disconnected from Steam.`);
    })

    client.on('steamGuard', function (domain, callback) {
        readline.question(`[${chalk.yellow('SYSTEM')}] Steam Guard Code: `, callback);
    });

    client.logOn({
        accountName: process.env.STEAM_USERNAME,
        password: process.env.STEAM_PASSWORD,
        rememberPassword: true,
        autoRelogin: true
    })
}
