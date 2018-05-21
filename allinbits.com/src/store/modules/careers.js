import axios from 'axios'

let prefix = 'https://api.github.com/repos/tendermint/aib-data/contents/'
let careerUrl = prefix + 'md/careers'

async function getFiles (careerDirectory) {
  return Promise.all(careerDirectory.map(c => {
    let url = prefix + c.path
    return getFile(url)
  }))
}

async function getFile (url) {
  return (await axios.get(url)).data
}

function addSlug (file) {
  let slug = file.name.split('.')[0]
  slug = slug.split('-')
  slug.shift()
  slug = slug.join('-')
  file.slug = slug
  return file
}

function addArea (file) {
  file.area = file.name.split('-')[0]
  return file
}

function addTitle (file) {
  let body = window.atob(file.content)
  let title = body.split('\n')[0]
  let titleArray = title.split(' ')
  titleArray.shift()
  title = titleArray.join(' ')
  file.title = title
  return file
}

function addBody (file) {
  let body = window.atob(file.content)
  body = body.split('\n')
  body.shift()
  file.body = body.join('\n')
  return file
}

async function getCareers (url) {
  let dir = (await axios.get(careerUrl)).data
  let careers = await getFiles(dir)
  careers.map(c => addSlug(c))
  careers.map(c => addArea(c))
  careers.map(c => addTitle(c))
  careers.map(c => addBody(c))
  state.all = careers
  return careers
}

getCareers()

const state = {
  all: []
}
const mutations = {}

export default { state, mutations }
