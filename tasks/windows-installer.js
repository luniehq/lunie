var electronInstaller = require('electron-winstaller');
var package = require('../package.json')

// Installer is customizable: https://github.com/electron/windows-installer
let resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './builds/Cosmos-win32-x64',
    outputDirectory: './builds/cosmos/Cosmos-win32',
    title: 'Cosmos',
    authors: package.author,
    exe: 'Cosmos.exe',
    setupExe: `Cosmos-Setup-v${package.version}.exe`,
    iconUrl: 'https://github.com/cosmos/cosmos-ui/raw/develop/app/icons/icon.ico',
    setupIcon: './app/icons/icon.ico',
    noMsi: true
  });

return resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));