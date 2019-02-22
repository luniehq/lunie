export function getURLParams(window) {
  const queries = window.location.search.slice(1).split(`&`)
  return queries.reduce((config, current) => {
    const [name, value] = current.split(`=`)
    if ([`stargate`, `rpc`, `devMode`].includes(name)) {
      return {
        ...config,
        [name]: value
      }
    }
    return config
  }, {})
}
