var electronInstaller = require("electron-winstaller")
var { author, version } = require("../package.json")

// Installer is customizable: https://github.com/electron/windows-installer
let resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: "./builds/cosmos-voyager-win32-x64",
  outputDirectory: "./builds/cosmos/cosmos-voyager-win32",
  title: "Cosmos Voyager",
  authors: author,
  exe: "Cosmos Voyager.exe",
  setupExe: `Cosmos-Voyager-Setup-v${version}.exe`,
  iconUrl: "https://github.com/cosmos/voyager/raw/develop/app/icons/icon.ico",
  setupIcon: "./app/icons/icon.ico",
  noMsi: true
})

return resultPromise.then(
  () => console.log("It worked!"),
  e => console.log(`No dice: ${e.message}`)
)
