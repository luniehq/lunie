const {escapeValue, gqlKeyValue} = require("../../lib/database/helpers")

describe("database helpers", () => {
    describe("escape values", () => {
        it("boolean", () => {
            expect(escapeValue(true)).toBe(true)
        })
        it("string", () => {
            expect(escapeValue("HALLO WORLD")).toBe("HALLO WORLD")
        })
        it("malicious string", () => {
            expect(escapeValue("<script></script>")).toBe("&lt;script&gt;&lt;/script&gt;")
        })
        it("number", () => {
            expect(escapeValue(42)).toBe(42)
        })
        it("object", () => {
            expect(escapeValue({a: {b: "<script></script>", c: 42}})).toBe(`"{\"a\":{\"b\":\"&lt;script&gt;&lt;/script&gt;\",\"c\":42}}"`)
        })
        it("null", () => {
            expect(gqlKeyValue(["x", undefined])).toBe(`x: ""`)
        })
    })
})