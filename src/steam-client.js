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
        consoleHelper.info('Connection to Steam established.');
    });

    client.on('accountInfo', (...data) => {
        consoleHelper.info('Account info received.');
        consoleHelper.info(`Logged in as ${data[0]} from ${data[1]}.`);

        client.setPersona(steamUser.EPersonaState.Online);
        consoleHelper.info('Set persona state to online.');

        playing_current_session = true;
        client.gamesPlayed(games);
        consoleHelper.info(`Set game to ${games}.`);
    });

    client.on('error', error => {
        if (error.eresult !== 6) {
            consoleHelper.error(error);
            process.exit(1);
        }

        consoleHelper.warn('Logged in elsewhere. Waiting to relaunch game...');

        client.logOn({ refreshToken: process.env.REFRESH_TOKEN });
    });

    client.on('playingState', (blocked, playingApp) => {
        if (blocked) {
            playing_current_session = false;
        } else {
            if (!playing_current_session) {
                playing_current_session = true;

                client.gamesPlayed(games);
                consoleHelper.info(`Relaunched ${games}.`);
            }
        }
    });

    client.on('disconnected', () => {
        consoleHelper.warn('Disconnected from Steam.');
    });

    client.logOn({
        refreshToken: process.env.REFRESH_TOKEN
    });
};
