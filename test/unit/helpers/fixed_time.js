/* globals jest */
require("moment")
const mockMomentTz = require("moment-timezone")
jest.mock("moment", () => time => mockMomentTz(time).tz("Europe/Berlin"))

const DATE_TO_USE = new Date(Date.UTC(1988, 0, 5, 8, 0, 0))
global._Date = Date
console.log("1 - date says", DATE_TO_USE.toISOString())
global.Date = jest.fn(() => new global._Date(DATE_TO_USE.toISOString()))
Date.now = jest.genMockFunction().mockReturnValue(1608)
