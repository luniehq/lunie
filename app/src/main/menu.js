const { app, Menu, shell } = require("electron")

module.exports = function() {
  let template = [
    {
      label: "Cosmos Voyager",
      submenu: [
        {
          label: "About Cosmos Voyager",
          selector: "orderFrontStandardAboutPanel:"
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
