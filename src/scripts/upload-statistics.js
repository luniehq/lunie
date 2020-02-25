import * as Fingerprint2 from "fingerprintjs2"
import { getGraphqlHost } from "scripts/url"

export const uploadStatistics = async (customObject, ...args) => {
  customObject = Object.assign({}, customObject) // needed to prevent further modifications
  const graphqlHost = getGraphqlHost()
  var fp_options = {
    excludes: {
      touchSupport: true
    }
  }
  let components = await Fingerprint2.getPromise(fp_options)
  var values = components.map(component => component.value)
  var murmur = Fingerprint2.x64hash128(values.join(``), 31)

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
          browserid: murmur
        }
      }
    })
  }
  return fetch(`${graphqlHost}/stats/store`, options).then(result =>
    result.json()
  )
}
