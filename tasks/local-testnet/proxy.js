const httpProxy = require(`http-proxy`),
  fs = require(`fs`),
  { join } = require(`path`)

httpProxy.createServer({
  target: `http://localhost:9070`,
  ssl: {
    key: fs.readFileSync(join(__dirname, `certs/key.pem`), `utf8`),
    cert: fs.readFileSync(join(__dirname, `certs/cert.pem`), `utf8`)
  }
}).listen(9071)