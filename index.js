// Importing required packageInfos \\
require('dotenv').config();

const asciiart = require('asciiart-logo');
const cliSelect = require('cli-select');
const chalk = require('chalk');
const SteamUser = require('steam-user');

const packageInfo = require('./package.json');
const games = require('./games.json');

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

    client.on('loggedOn', (details, parental) => {
        console.log(`[${chalk.yellow('SYSTEM')}] Connection to Steam established.`);
    });

    client.on('accountInfo', (...data) => {
        console.log(`[${chalk.yellow('SYSTEM')}] Account info received.`);
        console.log(`[${chalk.yellow('SYSTEM')}] Logged in as ${chalk.yellow(data[0])} from ${chalk.yellow(data[1])}.`);

        client.setPersona(SteamUser.EPersonaState.Online);
        console.log(`[${chalk.yellow('SYSTEM')}] Set persona state to ${chalk.blueBright('online')}.`);

        client.gamesPlayed([game.appid]);
        console.log(`[${chalk.yellow('SYSTEM')}] Set game to ${chalk.greenBright(game.name)}.`);
    })

    client.on('error', function (e) {
        console.log(`[${chalk.yellow('SYSTEM')}] Error: ${e}`);
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
    })
}
