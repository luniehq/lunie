const { normalize, sep } = require("path")
const { Writable } = require("stream")

/*
* this mock implements every function (all used in this project for now) in fs-extra so that the file system is just represented by a json file holding file content as strings
*/
export default function mockFsExtra(fileSystem = {}) {
  const fsExtraMock = {
    copy: (from, to) => {
      let { file } = get(from, fsExtraMock.fs)
      if (file === null) {
        throwENOENT(from)
      }
      create(to, fsExtraMock.fs, file)
    },
    ensureFile: path => {
      let { file } = get(path, fsExtraMock.fs)
      if (file === null) {
        create(path, fsExtraMock.fs)
      }
    },
    ensureDir: path => {
      let { file } = get(path, fsExtraMock.fs)
      if (file === null) {
        create(path, fsExtraMock.fs)
      }
    },
    createWriteStream: () => new Writable(),
    // for simplicity we say if there is a file we can access it
    access: path => {
      let { file } = get(path, fsExtraMock.fs)
      if (file === null) {
        throwENOENT(path)
        return false
      }
      return !!get(path, fsExtraMock.fs).file
    },
    remove: path => {
      let { parent, name } = get(path, fsExtraMock.fs)
      delete parent[name]
    },
    readFile: path => {
      let { file } = get(path, fsExtraMock.fs)
      if (!file) {
        throwENOENT(path)
      }
      return file
    },
    writeFile: (path, file) => create(path, fsExtraMock.fs, file),
    pathExists: path => !!get(path, fsExtraMock.fs).file,
    exists: path => {
      let { file } = get(path, fsExtraMock.fs)
      return file !== null
    },
    readJson: path => {
      let { file } = get(path, fsExtraMock.fs)
      return JSON.parse(file)
    }
  }

  // all methods are synchronous in tests
  Object.keys(fsExtraMock).forEach(key => {
    fsExtraMock[key + "Sync"] = fsExtraMock[key]
  })

  // for debugging
  fsExtraMock.MOCKED = true
  fsExtraMock.fs = fileSystem

  // strip long content from fs
  function fsToString(fs) {
    // clone
    fs = JSON.parse(JSON.stringify(fs))
    Object.keys(fs).forEach(key => {
      if (typeof fs[key] === "object") {
        fs[key] = fsToString(fs[key])
      } else {
        fs[key] = "#CONTENT#"
      }
    })
    return fs
  }

  function throwENOENT(path) {
    let error = new Error(
      "Path " +
        path +
        " doesnt exist.\nFS:" +
        JSON.stringify(fsToString(fileSystem), null, 2)
    )
    error.code = "ENOENT"
    throw error
  }

  function get(path, fs) {
    path = normalize(path)
    let pathArr = path.split(sep).filter(x => x !== "")
    let current = pathArr.shift()

    if (fs[current]) {
      if (pathArr.length === 0) {
        return {
          file: fs[current],
          name: current,
          parent: fs
        }
      }
      return get(pathArr.join("/"), fs[current])
    }
    return {
      file: null,
      name: current,
      parent: fs
    }
  }

  function create(path, fs, file = {}) {
    path = normalize(path)
    let pathArr = path.split(sep).filter(x => x !== "")
    let current = pathArr.shift()

    if (!fs[current]) {
      fs[current] = {}
    }
    if (pathArr.length === 0) {
      if (typeof file === "object") {
        // clone object
        fs[current] = JSON.parse(JSON.stringify(file))
      } else {
        fs[current] = file
      }
      return true
    }
    return create(pathArr.join("/"), fs[current], file)
  }

  return fsExtraMock
}
