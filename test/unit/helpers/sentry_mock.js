jest.mock(`@sentry/browser`, () => ({
  init: () => {},
  configureScope: () => {},
  captureException: () => {}
}))
