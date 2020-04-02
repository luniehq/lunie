const fetch = require("node-fetch")

const getVersion = () => {
  const packageJSON = require("../package.json")
  return packageJSON.version
}

const graphQLQuery = ({ hasura_url, hasura_admin_key }) => async query => {
  const data = await fetch(hasura_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": hasura_admin_key
    },
    body: JSON.stringify({
      query
    })
  }).then(res => res.json())

  if (data.errors || data.error) {
    console.error("Query failed:", query)
    console.error("GraphQL query failed:", data.error || data.errors)
    throw new Error("GraphQL query failed")
  }

  return data
}

async function setNewVersion(config) {
  const query = `
    mutation { update_versions(where: {instance:{_eq: "${config.instance}"}}, _set: {
        version: "${config.version}"
    }) {
        affected_rows
    } }
`
  const res = await graphQLQuery(config)(query)
  if (res.data.update_versions.affected_rows === 0) {
    throw new Error("Failed to update version")
  }
}

async function main() {
  const config = {
    hasura_url: process.env.HASURA_URL,
    hasura_admin_key: process.env.HASURA_ADMIN_KEY,
    instance: process.env.VERSION_INSTANCE,
    version: getVersion()
  }

  return await setNewVersion(config)
}

main()
