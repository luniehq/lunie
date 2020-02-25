import browserID from "browser-id"
import { getGraphqlHost } from "scripts/url"

export const uploadStatistics = (customObject, ...args) => {
  const graphqlHost = getGraphqlHost()
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      payload: {
        ...customObject,
        ...{
          category: args[0],
          action: args[1],
          label: args[2],
          value: args[3],
          browserid: browserID()
        }
      }
    })
  }
  return fetch(`${graphqlHost}/stats/store`, options).then(result =>
    result.json()
  )
}
