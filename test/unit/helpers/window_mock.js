// window is already mocked but not every part of it
global.scroll = jest.fn()

global.navigator = {
  clipboard: {
    writeText: jest.fn()
  }
}
