require('dotenv').config();

const fs = require('fs');
const consoleHelper = require('./helpers/console');
const steamClient = require("./steam-client");

consoleHelper.boot();

if (!fs.existsSync('./.env')) {
    consoleHelper.warn('No .env file found. Attempting to create one...');
    fs.copyFileSync('./.env.example', './.env');
    consoleHelper.success('Successfully created .env file.');
}

if (!process.env.REFRESH_TOKEN) {
    consoleHelper.error('No refresh token found in .env file. Attempting to get one from Steam...');

    const steamSession = require('./steam-session');

    steamSession.then(async session => {
        const censoredAccountName = session.accountName.slice(0, (session.accountName.length / 2.5)) + session.accountName.slice((session.accountName.length / 2.5)).replace(/./g, '*');

        consoleHelper.success(`Session details received for ${censoredAccountName}. (SteamID: ${session.steamID})`);

        await fs.writeFileSync('./.env', `REFRESH_TOKEN=${session.refreshToken}`, { encoding: 'utf8' });

        consoleHelper.success('Refresh token saved to .env file. Please restart the process.');
        process.exit(0);
    }).catch(consoleHelper.error);
} else {
    steamClient();
}
