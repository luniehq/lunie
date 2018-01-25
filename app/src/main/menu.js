const { app, Menu } = require('electron')

module.exports = function () {
  let template = [
    {
      label: 'Cosmos',
      submenu: [
        { label: 'About Cosmos UI', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    }
  ]

  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
