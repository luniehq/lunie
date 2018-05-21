let path = require("path")

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set("assets", resolve("src/assets"))
      .set("images", resolve("src/assets/images"))
      .set("comp", resolve("src/components"))
      .set("scripts", resolve("src/scripts"))
      .set("variables", resolve("src/styles/variables.styl"))
      .set("buttons", resolve("src/components/buttons"))
      .set("cards", resolve("src/components/cards"))
      .set("common", resolve("src/components/common"))
      .set("forms", resolve("src/components/forms"))
      .set("modals", resolve("src/components/modals"))
      .set("navigation", resolve("src/components/navigation"))
      .set("pages", resolve("src/components/pages"))
      .set("sections", resolve("src/components/sections"))
    config.module
      .rule("pdf")
      .test(/\.pdf/)
      .use("")
      .loader("file-loader")
  }
}
