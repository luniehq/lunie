/** If you want to use the local development environment with the dev backend,
 * this will create a proxy so you won't run into CORS issues.
 * It accepts the following command line parameters:
 * - port the port where the proxy will listen
 * - target the DEV backend target to contact.
 * Example: If you set the port to 3000 and target to https://dev.nibo.ai then
 * your actual "resourceBaseUrl" in NiboSettings should be http://localhost:3000/api/v1
 */
// parse command line options
const options = {
  port: 9071,
  target: `http://localhost:9070`
}

// Start the proxy
console.log(`Start proxy on port`, options.port, `for`, options.target)
const httpProxy = require(`http-proxy`)

// Create a proxy server with custom application logic
const proxy = httpProxy.createProxyServer({})
const sendError = function(res, err) {
  console.error("Error:", err)
  res.writeHead(500)
  res.write("An error occurred in the proxy.")
  res.end()
}

// error handling
proxy.on(`error`, function(err, req, res) {
  if (res) {
    sendError(res, err)
  } else {
    console.error(err)
  }
})

const enableCors = function(req, res) {
  function setRequestedAccessControlHeader(requestHeader, allowHeader) {
    if (req.headers[requestHeader]) {
      res.setHeader(allowHeader, req.headers[requestHeader])
    }
  }

  setRequestedAccessControlHeader(
    `access-control-request-headers`,
    `access-control-allow-headers`
  )
  setRequestedAccessControlHeader(
    `access-control-allow-origin`,
    `access-control-request-headers`
  )

  if (req.headers.origin) {
    res.setHeader(`access-control-allow-origin`, req.headers.origin)
    res.setHeader(`access-control-allow-credentials`, `true`)
  }
}

// set header for CORS
proxy.on(`proxyRes`, function(proxyRes, req, res) {
  enableCors(req, res)
})

const fs = require(`fs`),
  { join } = require(`path`),
  https = require(`https`)

const privateKey = fs
  .readFileSync(join(__dirname, `../../certs/dev.key`))
  .toString()
const certificate = fs
  .readFileSync(join(__dirname, `../../certs/dev.crt`))
  .toString()

const server = https.createServer(
  {
    key: privateKey,
    cert: certificate
  },
  function(req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    if (req.method === `OPTIONS`) {
      enableCors(req, res)
      res.writeHead(200)
      res.end()
      return
    }

    proxy.web(
      req,
      res,
      {
        target: options.target,
        secure: true,
        changeOrigin: true
      },
      function(err) {
        sendError(res, err)
      }
    )
  }
)

server.listen(options.port)
