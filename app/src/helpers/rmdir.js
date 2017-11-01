const fs = require('fs')

// under windows removing folders results in several errors EPERM, ENOTEMPTY
// adding the timeout solves these issues
async function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(async function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        await deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    await sleep(10)
    fs.rmdirSync(path);
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = deleteFolderRecursive