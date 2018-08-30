const { app, Menu, shell, dialog } = require("electron")
const { join } = require("path")

module.exports = function() {
  let template = [
    {
      label: "Cosmos Voyager",
      submenu: [
        {
          label: "About Cosmos Voyager",
          selector: "orderFrontStandardAboutPanel:",
          click: () => openAboutMenu()
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => app.quit()
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          selector: "cut:"
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          selector: "copy:"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          selector: "paste:"
        }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Report An Issue",
          click() {
            shell.openExternal("https://github.com/cosmos/voyager/issues/new")
          }
        },
        {
          label: "View Application Log",
          click() {
            shell.openItem(global.root + "/main.log")
          }
        }
      ]
    }
  ]

  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function openAboutMenu() {
  const voyagerVersion = require("../../../package.json").version
  const gaiaVersion = process.env.GAIA_VERSION
  const electronVersion = app.getVersion()

  const imageLocation =
    process.env.NODE_ENV === "development"
      ? join(__dirname, "../renderer/assets/images")
      : join(__dirname, "./imgs")

  dialog.showMessageBox({
    type: "info",
    title: "About Voyager",
    message: `Versions\n\nVoyager ${voyagerVersion}\nCosmos SDK ${gaiaVersion}\nElectron ${electronVersion}`,
    icon: join(imageLocation, "cosmos-logo.png")
  })
}
