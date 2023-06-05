const steamUser = require("steam-user");
const consoleHelper = require("./helpers/console");
const games = require('./games');

module.exports = function () {
    let playing_current_session = false;

    const client = new steamUser({
        dataDirectory: './data',
        machineIdType: 4, // 1 = None, 2 = Always Random, 3 = Account Name Generated, 4 = Persistent Random
    });

    client.on('loggedOn', (details, parental) => {
        if (!playing_current_session) consoleHelper.info('Connection to Steam established.');
    });

    client.on('accountInfo', (...data) => {
        consoleHelper.info('Account info received.');
        consoleHelper.info(`Logged in as ${data[0]} from ${data[1]}.`);

        client.setPersona(steamUser.EPersonaState.Online);
        consoleHelper.info('Set persona state to online.');
    });

    client.on('error', error => {
        if (error.eresult !== 6) {
            consoleHelper.error(error);
            process.exit(1);
        }

        client.logOn({ refreshToken: process.env.REFRESH_TOKEN });
    });

    client.on('playingState', (blocked, playingApp) => {
        if (blocked) {
            client.getProductInfo([playingApp], [], (error, apps) => {
                if (error) return consoleHelper.warn('Logged in elsewhere. Waiting to relaunch game...');

                consoleHelper.warn(`Playing ${apps[playingApp].appinfo.common.name} elsewhere. Waiting to relaunch game...`)
            });
            
            playing_current_session = false;
        } else {
            if (!playing_current_session) {
                playing_current_session = true;

                client.gamesPlayed(games);
                consoleHelper.info(`Launched ${games}.`);
            }
        }
    });

    client.on('disconnected', () => {
        consoleHelper.warn('Disconnected from Steam. Attempting to reconnect...');
    });

    client.logOn({
        refreshToken: process.env.REFRESH_TOKEN
    });
};
