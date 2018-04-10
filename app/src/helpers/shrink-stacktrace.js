import StackTrace from "stacktrace-js"

/*
* ATTENTION: Enable sourcemaps in Chrome!!
* ATTENTION: Use "devtool: '#eval-source-map'" for webpack
*/
export default function shrinkStacktrace(
  error,
  blackList = /node_modules/,
  whiteList = /.*/
) {
  // stacktrace.js gives us the sourcemappes filenames
  StackTrace.fromError(error, { offline: true })
    .then(frames => {
      let filteredFrames = frames
        .filter(frame => {
          // we check the sourcemapped frames for filenames blacklisted / whitelisted
          return blackList.test(frame.fileName)
            ? false
            : whiteList.test(frame.fileName)
        })
        .map(frame => frame.source)

      console.error(error.message + "\n" + filteredFrames.join("\n"))
    })
    .catch(console.error)
}
