// use to map any file or extension to an empty module
// i.e. you want to ignore .css imports in jest tests
module.exports = {
  process() {
    return ""
  },
}
