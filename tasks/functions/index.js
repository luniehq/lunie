const { promisify } = require(`util`)
const { join, resolve } = require(`path`)
const fs = require(`fs`)
const exec = promisify(require(`child_process`).exec)

exports.handler = async function (event, context, cb) {
  console.log(__dirname)
  const exePath = resolve(__dirname, `./gaiacli`)
  console.log(fs.existsSync(exePath))
  const output = await exec(`./gaiacli version`)
  console.log(output)
}

if (require.main === module) {
  exports.handler()
}