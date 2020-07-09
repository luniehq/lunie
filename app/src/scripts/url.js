import config from "src/../config"

export function getURLParams(window) {
  const queries = window.location.search.slice(1).split(`&`)
  const parameters = queries.reduce((config, current) => {
    const [name, value] = current.split(`=`)
    if (
      [
        `experimental`,
        `insecure`,
        `api`,
        `iwouldliketochangetheapipersistentlyandiknowwhatido`,
        `network`,
      ].includes(name)
    ) {
      return {
        ...config,
        [name]: value,
      }
    }
    return config
  }, {})

  return parameters
}

export const getGraphqlHost = () => {
  const urlParams = getURLParams(window)

  return (
    checkPersistentAPI(urlParams) ||
    (urlParams.api ? decodeURIComponent(urlParams.api) : false) ||
    config.graphqlHost
  )
}

// persistent api
// setting api url in localStorage
const checkPersistentAPI = (urlParams) => {
  if (
    typeof urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido !==
    "undefined"
  ) {
    // removing presistent api on false value
    if (
      !urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido ||
      urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido == "false"
    ) {
      localStorage.removeItem(`persistentapi`)
      return false
    }
    // setting presistent api
    if (urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido) {
      localStorage.setItem(
        `persistentapi`,
        decodeURIComponent(
          urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido
        )
      )
      return decodeURIComponent(
        urlParams.iwouldliketochangetheapipersistentlyandiknowwhatido
      )
    }
  }

  if (localStorage.getItem(`persistentapi`)) {
    console.warn(
      "Your API version differ from normal. Query ?iwouldliketochangetheapipersistentlyandiknowwhatido=false to reset"
    )
    return localStorage.getItem(`persistentapi`)
  }
  return false
}
