const { Writable } = require('stream')

export default function mockFsExtra (fileSystem = {}) {
  const fsExtraMock = {
    ensureFile: (path) => create(path, fileSystem),
    createWriteStream: () => new Writable(),
    access: (path) => {
      let {file} = get(path, fileSystem)
      if (!file) {
        throwENOENT()
      }
      !!get(path, fileSystem).file
    },
    copy: (from, to) => {
      let {file} = get(from, fileSystem)
      if (!file) {
        throwENOENT()
      }
      create(to, fileSystem, file)
    },
    remove: (path) => {
      let {parent, name} = get(path, fileSystem)
      delete parent[name]
    },
    ensureDir: (path) => create(path, fileSystem),
    readFile: (path) => {
      let {file} = get(path, fileSystem)
      if (!file) {
        throwENOENT()
      }
      return file
    },
    writeFile: (path, file) => create(path, fileSystem, file),
    pathExists: (path) => !!get(path, fileSystem).file,
    exists: (path) => !!get(path, fileSystem).file
  }

  // all methods are synchronous in tests
  Object.keys(fsExtraMock).forEach(key => {
    fsExtraMock[key + 'Sync'] = fsExtraMock[key]
  })

  function throwENOENT () {
    let error = new Error('File doesnt exist. FS: ' + JSON.stringify(fileSystem))
    error.code = 'ENOENT'
    throw error
  }

  function get (path, fs) {
    let pathArr = path.split('/')
    let current = pathArr.shift()

    if (current === '.') {
      return get(pathArr.join('/'), fs)
    }

    if (fs[current]) {
      if (pathArr.length === 0) {
        return {
          file: fs[current],
          name: current,
          parent: fs
        }
      }
      return get(pathArr.join('/'), fs[current])
    }
    return {
      file: null,
      name: current,
      parent: fs
    }
  }

  function create (path, fs, file = {}) {
    let pathArr = path.split('/')
    let current = pathArr.shift()

    if (!fs[current]) {
      fs[current] = {}
    }
    if (pathArr.length === 0) {
      fs[current] = file
      return true
    }
    return create(pathArr.join('/'), fs[current], file)
  }

  return fsExtraMock
}
