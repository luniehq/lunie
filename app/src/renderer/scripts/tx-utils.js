import crypto from "crypto"
import varint from "varint"

export function getTxHash(txstring) {
  let txbytes = Buffer.from(txstring, "base64")
  let varintlen = new Uint8Array(varint.encode(txbytes.length))
  let tmp = new Uint8Array(varintlen.byteLength + txbytes.byteLength)
  tmp.set(new Uint8Array(varintlen), 0)
  tmp.set(new Uint8Array(txbytes), varintlen.byteLength)
  return crypto
    .createHash("ripemd160")
    .update(Buffer.from(tmp))
    .digest("hex")
}
