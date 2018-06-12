import bech32 from "bech32"
class b32 {
  decode(value) {
    let words = bech32.decode(value)
    return bech32.fromWords(words)
  }
  encode(value, prefix = "tb", type = "hex") {
    let words = bech32.toWords(Buffer.from(value, type))
    return bech32.encode(prefix, words)
  }
}
export default new b32()
