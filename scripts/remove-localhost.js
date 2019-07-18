const fs = require('fs')

fs.readFile(__dirname + '/../dist/manifest.json', (error, data) => {
  if (error) {
    console.log('Error retrieving dst/manifest.json =', error)
  } else {
    let manifest = JSON.parse(data)
    manifest.content_scripts = manifest.content_scripts.map(scripts => {
      scripts.matches = scripts.matches.filter(
        match => match.indexOf('localhost') === -1
      )
      return scripts
    })
    fs.writeFile(
      __dirname + '/../dist/manifest.json',
      JSON.stringify(manifest),
      error => {
        if (error) {
          console.log(
            'Error removing localhost for content scripts in dst/manifest.json =',
            error
          )
        }
      }
    )
  }
})
