let glob = require(`glob`)
let fs = require(`fs`)
let pug = require(`pug`)
let beautify_html = require(`js-beautify`).html

glob(`**/*.vue`, function(err, files) {
  if (err) {
    console.log(err)
  } else {
    // a list of paths to javaScript files in the current working directory

    files.forEach(async file => {
      let templateRegExp = /.*<template lang="pug">([\s\S\n]*)<\/template>.*/
      let content = fs.readFileSync(file, `utf8`)
      //   console.log(content)
      let match = templateRegExp.exec(content)
      if (!match) return
      let template = match[1]
      if (template.split(`\n`)[1].startsWith(`  `)) {
        template = template
          .split(`\n`)
          .map(line => line.slice(2))
          .join(`\n`)
      }
      try {
        let html = pug.render(template)
        let replaced = content.replace(
          templateRegExp,
          `<template>\n` +
            beautify_html(html, {
              wrap_line_length: 80,
              wrap_attributes: true
            }) +
            `\n</template>`
        )
        fs.writeFileSync(file, replaced, `utf8`)
      } catch (err) {
        console.log(file, `failed`, err)
      }
    })
  }
})
