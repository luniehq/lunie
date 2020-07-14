const { escapeValue, gqlKeyValue } = require('../../lib/database/helpers')

describe('database helpers', () => {
  describe('escape values', () => {
    it('boolean', () => {
      expect(escapeValue(true)).toBe(true)
    })
    it('string', () => {
      expect(escapeValue('HALLO WORLD')).toBe(`HALLO WORLD`)
    })
    it('malicious string', () => {
      expect(escapeValue('<script></script>')).toBe(
        `&lt;script&gt;&lt;/script&gt;`
      )
    })
    it('number', () => {
      expect(escapeValue(42)).toBe(42)
    })
    it('object', () => {
      expect(escapeValue({ a: { b: '<script></script>', c: 42 } })).toEqual({
        a: { b: '&lt;script&gt;&lt;/script&gt;', c: 42 }
      })
    })
    it('null', () => {
      expect(gqlKeyValue(['x', undefined])).toBe(`x: ""`)
    })
    it('string top level', () => {
      expect(gqlKeyValue(['x', 'hallo world'])).toBe(`x: "hallo world"`)
    })
    it('boolean value', () => {
      expect(gqlKeyValue(['x', false])).toBe(`x: false`)
    })
    it('object value', () => {
      expect(gqlKeyValue(['x', { a: { b: 'hallo' } }])).toBe(
        `x: "{\\"a\\":{\\"b\\":\\"hallo\\"}}"`
      )
    })
    it('null value', () => {
      expect(gqlKeyValue(['x', undefined])).toBe(`x: ""`)
    })
  })
})
