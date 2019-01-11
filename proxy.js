let express = require(`express`)
let axios = require(`axios`)
let cors = require(`cors`)
let https = require(`https`)

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})

let app = express()
app.use(cors())
app.use(`/`, async function(req, res) {
  try {
    let url = req.url.substr(1)
    let method = req.method
    let data = req.body

    const result = await instance({
      method,
      url,
      data
    })
    res.send(result.data)
  } catch (err) {
    console.error(err)
  }
})

app.listen(process.env.PORT || 8080)
