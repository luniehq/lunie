describe(`AxiosProxy`, () => {
  let ipcRenderer
  let AxiosProxy
  beforeEach(() => {
    jest.resetModules()
    ipcRenderer = require(`electron`).ipcRenderer
    AxiosProxy = require(`renderer/scripts/axiosProxy.js`)
  })

  beforeAll(() => {
    jest.spyOn(console, `log`).mockImplementation(() => {})
  })

  afterAll(() => {
    console.log.mockReset()
  })

  it(`should send requests via ipc`, () => {
    const axios = AxiosProxy()
    axios({ method: `POST`, url: `/keys/add`, data: { name: `fabo` } })

    const requestCounter = 1
    expect(ipcRenderer.send).toHaveBeenCalledWith(`Axios`, requestCounter, {
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })
    expect(ipcRenderer.once).toHaveBeenCalledWith(
      `Axios/1`,
      expect.any(Function)
    )
  })

  it(`should send requests with increasing request counters`, () => {
    const axios = AxiosProxy()
    axios({ method: `POST`, url: `/keys/add`, data: { name: `fabo` } })
    axios({ method: `POST`, url: `/keys/add`, data: { name: `fede` } })

    const requestCounter = 2
    expect(ipcRenderer.send).toHaveBeenCalledWith(`Axios`, requestCounter, {
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fede` }
    })
    expect(ipcRenderer.once).toHaveBeenCalledWith(
      `Axios/2`,
      expect.any(Function)
    )
  })

  it(`should respond to answers from the main thread to requests`, async () => {
    ipcRenderer.once = (channel, cb) => {
      cb(`xxx`, { exception: null, value: `HALLO WORLD` })
    }

    const axios = AxiosProxy()
    const result = await axios({
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })

    expect(result).toBe(`HALLO WORLD`)
  })

  it(`should remove the channel listener after receiving a response`, async () => {
    ipcRenderer.once = (channel, cb) => {
      cb(`xxx`, { exception: null, value: `HALLO WORLD` })
    }

    const axios = AxiosProxy()
    await axios({
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })

    expect(ipcRenderer.removeAllListeners).toHaveBeenCalledWith(`Axios/1`)
  })

  it(`should pass through exceptions`, async done => {
    ipcRenderer.once = (channel, cb) => {
      cb(`xxx`, { exception: `Error`, value: null })
    }

    jest.spyOn(console, `error`).mockImplementation(() => {})

    const axios = AxiosProxy()
    await axios({
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })
      .then(() => done.fail())
      .catch(error => {
        expect(error).toBe(`Error`)
        done()
      })

    console.error.mockReset()
  })

  it(`should reset the requestCounter after max number is reached`, () => {
    const axios = AxiosProxy(Number.MAX_SAFE_INTEGER - 1)
    axios({
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })

    expect(ipcRenderer.send).toHaveBeenCalledWith(`Axios`, 0, {
      method: `POST`,
      url: `/keys/add`,
      data: { name: `fabo` }
    })
    expect(ipcRenderer.once).toHaveBeenCalledWith(
      `Axios/0`,
      expect.any(Function)
    )
  })
})
