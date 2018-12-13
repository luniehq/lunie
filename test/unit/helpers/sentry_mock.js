jest.mock(`@sentry/browser`, () => ({
  init: jest.fn(),
  configureScope: jest.fn(),
  captureException: jest.fn()
}))
