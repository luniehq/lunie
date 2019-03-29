const fs = require(`fs`)
const path = require(`path`)

function main() {
  let allChanges = ``
  const changesPath = path.join(__dirname, `changes`)
  fs.readdir(changesPath, function (err, files) {
    files.forEach(file => {
      const content = fs.readFileSync(file, `utf8`)
      allChanges += content
    })
  })

  fs.
}

main()