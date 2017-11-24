/* globals jest */

const DATE_TO_USE = new Date(1608)
const _Date = Date
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.UTC = _Date.UTC
global.Date.parse = _Date.parse
global.Date.now = jest.fn(() => DATE_TO_USE.getTime())
