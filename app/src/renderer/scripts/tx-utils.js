import crypto from "crypto"

export function getTxHash(txstring) {
  let s256Buffer = crypto
    .createHash("sha256")
    .update(Buffer.from(txstring, "base64"))
    .digest()
  let txbytes = new Uint8Array(s256Buffer)
  return Buffer.from(txbytes.slice(0, 20)).toString("hex")
}
