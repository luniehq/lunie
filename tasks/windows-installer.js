var electronInstaller = require('electron-winstaller');
var package = require('../package.json')

// Installer is customizable: https://github.com/electron/windows-installer
let resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './builds/Cosmos-win32-x64',
    outputDirectory: './builds/cosmos/Cosmos-win32',
    authors: package.author,
    exe: 'Cosmos.exe'
  });

return resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));