const { app, Menu } = require("electron")

module.exports = function(mainWindow) {
  let template = [
    {
      label: "Cosmos Voyager",
      submenu: [
        {
          label: "About Cosmos Voyager",
          selector: "orderFrontStandardAboutPanel:",
          click: () => openAboutMenu(mainWindow)
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
    }
  ]

  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function openAboutMenu(mainWindow) {
  if (process.platform === "darwin") return
  mainWindow.webContents.send("open-about-menu")
}
