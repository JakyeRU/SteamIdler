require('dotenv').config();

const consoleHelper = require('./helpers/console');
const qrCodeTerminal = require('qrcode-terminal');
const { LoginSession, EAuthTokenPlatformType } = require('steam-session');

const session = new LoginSession(EAuthTokenPlatformType.SteamClient);

module.exports = new Promise(async (resolve, reject) => {
    const qrCodeData = await session.startWithQR().catch(reject);

    consoleHelper.info('QR Code generated. Please scan it with the Steam Mobile Authenticator app.');

    qrCodeTerminal.generate(qrCodeData.qrChallengeUrl, { small: true });

    session.on('authenticated', () => {
        return resolve(session);
    });

    session.on('remoteInteraction', () => {
        return consoleHelper.info('Code scanned! Please confirm the login request on the Steam Mobile Authenticator app.');
    });

    session.on('timeout', () => {
        return reject('Timed out. Please try again.');
    });

    session.on('error', error => {
        if (error.eresult === 9) return reject('Login cancelled from Steam Mobile Authenticator app. Please try again.');

        return reject(error);
    });
});
