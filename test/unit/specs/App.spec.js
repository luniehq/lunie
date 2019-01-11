describe(`App Start`, () => {
  // popper.js is used by tooltips and causes some errors if
  // not mocked because it requires a real DOM
  jest.mock(`popper.js`, () => () => {})

  beforeEach(() => {
    window.history.pushState(
      {},
      `Mock Voyager`,
      `/?node=localhost&lcd_port=8080`
    )
    document.body.innerHTML = `<div id="app"></div>`
    jest.resetModules()
  })

  it(`has all dependencies`, async () => {
    await require(`renderer/main.js`)
  })
})
