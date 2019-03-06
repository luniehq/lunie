"use strict"

import crypto from "crypto"
import { Base64 } from "js-base64"

module.exports = {
  getTxHash(txstring) {
    const s256Buffer = crypto
      .createHash(`sha256`)
      .update(Buffer.from(txstring, `base64`))
      .digest()
    const txbytes = new Uint8Array(s256Buffer)
    return Buffer.from(txbytes.slice(0, 20)).toString(`hex`)
  },
  decodeTx(base64Tx) {
    const tx = Base64.decode(base64Tx)
    console.log(tx)
    return tx
  }
}
