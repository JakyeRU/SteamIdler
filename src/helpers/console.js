const chalk = require('chalk');
const qrcodeTerminal = require('qrcode-terminal');
const asciiart = require('asciiart-logo');
const packageInfo = require("../../package.json");

module.exports.success = message => {
    return console.log(`[${chalk.green('SUCCESS')}] ${chalk.green(message)}`);
};

module.exports.error = message => {
    if (Object.prototype.toString.call(message) === "[object Error]") {
        return console.log(`[${chalk.red('ERROR')}] ${chalk.red(message.message)}`);
    };

    return console.log(`[${chalk.red('ERROR')}] ${chalk.red(message)}`);
};

module.exports.info = message => {
    return console.log(`[${chalk.blue('INFO')}] ${chalk.blue(message)}`);
};

module.exports.warn = message => {
    return console.log(`[${chalk.yellow('WARN')}] ${chalk.yellow(message)}`);
};

module.exports.debug = message => {
    return console.log(`[${chalk.gray('DEBUG')}] ${chalk.gray(message)}`);
};

module.exports.clear = () => {
    return console.clear();
};

module.exports.qrcode = data => {
    return qrcodeTerminal.generate(data, { small: true });
};

module.exports.boot = () => {
    console.log(asciiart({
        name: 'Steam Idler',
        font: 'Standard',
        borderColor: 'grey',
        logoColor: 'lime',
        textColor: 'white',
    })
        .right(`v${packageInfo.version}`)
        .right(`by ${packageInfo.author}`)
        .emptyLine()
        .center(packageInfo.description)
        .render()
    );
};
