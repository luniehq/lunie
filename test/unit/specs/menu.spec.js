const { join } = require("path")

let mainWindow
describe("App Menu", () => {
  beforeEach(() => {
    jest.resetModules()
    jest.unmock("electron")

    mainWindow = {
      webContents: { send: jest.fn() }
    }

    jest.mock("electron", () => ({
      Menu: {
        buildFromTemplate: jest.fn(menu => {
          menu
        }),
        setApplicationMenu: jest.fn()
      },
      app: {
        quit: jest.fn()
      }
    }))

    let createMenu = require("../../../app/src/main/menu.js")

    createMenu(mainWindow)
  })

  it("should create the app menu", function() {
    expect(
      require("electron").Menu.buildFromTemplate.mock.calls
    ).toMatchSnapshot()
    expect(
      require("electron").Menu.setApplicationMenu.mock.calls
    ).toMatchSnapshot()
  })

  it("should quit app when clicking Quit menu item", function() {
    let menu = require("electron").Menu.buildFromTemplate.mock.calls[0][0]
    let quitItem = menu
      .find(({ label }) => label === "Cosmos Voyager")
      .submenu.find(({ label }) => label === "Quit")

    expect(require("electron").app.quit.mock.calls.length).toBe(0)
    quitItem.click()
    expect(require("electron").app.quit.mock.calls.length).toBe(1)
  })

  it("should send 'open-about-menu' when clicking 'About'", function() {
    process.platform = "linux"
    let menu = require("electron").Menu.buildFromTemplate.mock.calls[0][0]
    let aboutItem = menu
      .find(({ label }) => label === "Cosmos Voyager")
      .submenu.find(({ label }) => label === "About Cosmos Voyager")

    expect(mainWindow.webContents.send.mock.calls.length).toBe(0)
    aboutItem.click()
    expect(mainWindow.webContents.send.mock.calls.length).toBe(1)
    expect(mainWindow.webContents.send.mock.calls[0][0]).toBe("open-about-menu")
  })

  it("should not send 'open-about-menu' when clicking 'About' on mac", function() {
    process.platform = "darwin"
    let menu = require("electron").Menu.buildFromTemplate.mock.calls[0][0]
    let aboutItem = menu
      .find(({ label }) => label === "Cosmos Voyager")
      .submenu.find(({ label }) => label === "About Cosmos Voyager")

    expect(mainWindow.webContents.send.mock.calls.length).toBe(0)
    aboutItem.click()
    expect(mainWindow.webContents.send.mock.calls.length).toBe(0)
  })
})
