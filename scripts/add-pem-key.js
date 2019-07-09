const fs = require('fs')

fs.readFile(__dirname + '/../dist/manifest.json', (error, data) => {
  if (error) {
    console.log('Error retrieving dst/manifest.json =', error)
  } else {
    let manifest = JSON.parse(data)
    if (!manifest['key']) {
      manifest['key'] =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWWKi8PPH3u+bDCFJWTyvCwc9+kUt1l3WBt9vd3cQY7dpmEWGmFaeTNLLVWEE6+cwcUl4sOS9Jgj3J+svRtK8+CupAjL5RMRUh3v9amRZ4Gn0QT+x8K4Cg+KN+3fP6YnTw/QQI0laU2oEIpDbltuYz8x7zcZgmVtAeCo+55YNuR4q1hfc/ciSH5/wvkBplP8D0h4bhNAHNFUwmr39mTBhprr4KocMez09QcDIj7/5XGcaprLf0HpQx1rxD05ajxjUuM266Xz6uy5u6TvnqQoYZmPNo0zJoJIPiJ/qL+McQ6H8FzDs3Lhjv3OePbA+TOyx8uOCG0gNnyHlRAP5uPVzQIDAQAB'
      fs.writeFile(
        __dirname + '/../dist/manifest.json',
        JSON.stringify(manifest),
        error => {
          if (error) {
            console.log('Error writing PEM key to dst/manifest.json =', error)
          }
        }
      )
    }
  }
})
