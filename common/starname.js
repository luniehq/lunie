const networkToAsset = {
  "cosmos-hub-mainnet": "asset:atom",
  "cosmos-hub-testnet": "asset:atom",
  "kava-mainnet": "asset:kava",
  "kava-testnet": "asset:kava",
}

export const resolveStarname = async (starname, networkId) => {
  const asset = networkToAsset[networkId]
  if (!asset) throw new Error("Starname for this network is not supported.")

  const result = await fetch(
    "https://iovnscli-rest-api.iov-mainnet-2.iov.one/starname/query/resolve",
    {
      method: "POST",
      body: JSON.stringify({ starname }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  ).then((res) => res.json())

  if (result.error) throw new Error(result.error)

  let address = result.result.account.resources
    ? result.result.account.resources.find(({ uri }) => uri === asset).resource
    : undefined

  if (!address) throw new Error("Couldn't resolve starname " + starname)
  return address
}

export const isStarname = (address) => {
  const starnameRegexp = /^[a-z0-9\-]*\*[a-z0-9\-]+$/
  return starnameRegexp.test(address)
}
