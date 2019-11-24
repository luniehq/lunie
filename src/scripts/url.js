export function getURLParams(window) {
  const queries = window.location.search.slice(1).split(`&`)
  const parameters = queries.reduce((config, current) => {
    const [name, value] = current.split(`=`)
    if ([`experimental`, `insecure`, `graphql`, `network`].includes(name)) {
      return {
        ...config,
        [name]: value
      }
    }
    return config
  }, {})

  return parameters
}
