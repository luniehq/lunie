const networkToAsset = {
    "cosmos-hub-mainnet": "asset:atom",
    "cosmos-hub-testnet": "asset:atom",
    "kava-mainnet": "asset:kava",
    "kava-testnet": "asset:kava"
}

const resolveStarname = async (starname, networkId) => {
    const asset = networkToAsset[networkId]
    if (!asset) throw new Error("Starname for this network is not supported.")

    const result = await fetch("https://iovnscli-rest-api.iov-mainnet-2.iov.one/starname/query/resolve", {
        method: "POST",
        body: JSON.stringify(`{"starname":"${starname}"}`)
    }).then(res => res.json())

    const address = result.account.ressources.find(({uri}) => uri === asset)
    if (!address) throw new Error("Couldn't resolve starname " + starname)
    return address.ressource
}

const resolveStarnames = async (addresses, networkId) => {
    if (addresses) {
        return await Promise.all(addresses.map(address => {
            if (isStarname(address)) return await resolveStarname(address, networkId)
            return address
        }))
    }
}

export const resolveStarnameInMessage = async (messageWithStarnames, networkId) => {
    const message = JSON.parse(JSON.stringify(messageWithStarnames))
    message.to = await resolveStarnames(message.to, networkId)
    message.from = await resolveStarnames(message.from, networkId)
}

export const isStarname = (address) => {
  const starnameRegexp = /^[a-z\-]*\*[a-z\-]+$/
  return starnameRegexp.test(address)
}