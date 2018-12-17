let glob = require(`glob`)
let fs = require(`fs`)
let stylus = require(`stylus`)
let beautify_css = require(`js-beautify`).css

glob(`**/*.vue`, function(err, files) {
  if (err) {
    console.log(err)
  } else {
    // a list of paths to javaScript files in the current working directory

    files.forEach(async file => {
      let templateRegExp = /.*<style lang="stylus">([\s\S\n]*)<\/style>.*/
      let content = fs.readFileSync(file, `utf8`)
      //   console.log(content)
      content = content.replace(`@require '~variables'`, ``)
      content = content.replace(`@import '~variables'`, ``)
      let match = templateRegExp.exec(content)
      if (!match) return
      const template = match[1]
      if (template.split(`\n`)[1].startsWith(`  `)) {
        template = template
          .split(`\n`)
          .map(line => line.slice(2))
          .join(`\n`)
      }
      try {
        let css = stylus.render(template)
        let replaced = content.replace(
          templateRegExp,
          `<style>\n` +
            beautify_css(css, {
              wrap_line_length: 80,
              wrap_attributes: true
            }) +
            `\n</style>`
        )
        fs.writeFileSync(file, replaced, `utf8`)
      } catch (err) {
        console.log(file, `failed`, err)
      }
    })
  }
})

glob(`app/src/renderer/styles/**/*.styl`, function(err, files) {
  files.forEach(async file => {
    let content = fs.readFileSync(file, `utf8`)
    try {
      let css = stylus.render(content)
      fs.writeFileSync(file.replace(`.styl`, `.css`), css, `utf8`)
    } catch (err) {
      console.log(file, `failed`, err)
    }
  })
})
