// this mocks the IPC layer
jest.mock("electron", () => ({
  ipcRenderer: { send: jest.fn() },
  ipcMain: { on: jest.fn() }
}))
