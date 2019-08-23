export function getURLParams(window, env = process.env.NODE_ENV) {
  const queries = window.location.search.slice(1).split(`&`)
  const parameters = queries.reduce((config, current) => {
    const [name, value] = current.split(`=`)
    if (
      [`stargate`, `rpc`, `experimental`, `insecure`, `graphql`].includes(name)
    ) {
      return {
        ...config,
        [name]: value
      }
    }
    return config
  }, {})

  if (env === `production` && (parameters.stargate || parameters.rpc)) {
    alert(
      `The ability to set the remote stargate and full node was removed in production to improve security.`
    )
  }

  return parameters
}
