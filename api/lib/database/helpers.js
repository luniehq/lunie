const fetch = require('node-fetch')
const escape = require('escape-html')

const graphQLQuery = ({ hasura_url, hasura_admin_key }) => async (query) => {
  const data = await fetch(hasura_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': hasura_admin_key
    },
    body: JSON.stringify({
      query
    })
  }).then((res) => res.json())

  if (data.errors || data.error) {
    console.error('Query failed:', query)
    console.error(
      'GraphQL query failed:',
      JSON.stringify(data.error || data.errors, undefined, 2)
    )
    throw new Error('GraphQL query failed')
  }

  return data
}

function gqlKeyValue([key, value]) {
  // escape all values as they could be malicious
  return `${key}: "${escape(value)}"`
}

// stringify a set of row to be according to the graphQL schema
function stringifyForGraphQL(rows, height, chainId) {
  if (!Array.isArray(rows)) {
    rows = [rows]
  }
  // set the height for every row if specified
  if (height !== undefined) {
    rows = rows.map((row) => Object.assign(row, { height }))
  }
  // set the height for every row if specified
  if (chainId !== undefined) {
    rows = rows.map((row) => Object.assign(row, { chain_id: chainId }))
  }
  return `[
    ${rows
      .map((row) => {
        return `{${Object.entries(row).map(gqlKeyValue).join(', ')}}`
      })
      .join(',\n')}
    ]`
}

// get all columns for a db object
function getColumns(objects) {
  const obj = Array.isArray(objects) ? objects[0] : objects
  return Object.keys(obj)
}

const insert = ({ hasura_url, hasura_admin_key }, upsert = false) => (
  schema
) => async (table, rows, height, chainId, returnKeys) => {
  if ((Array.isArray(rows) && rows.length === 0) || !rows) {
    return
  }

  returnKeys = Array.isArray(returnKeys) ? returnKeys : []
  let schema_prefix = schema ? schema + '_' : ''

  const query = `
        mutation {
            insert_${schema_prefix}${table} (
                objects: ${stringifyForGraphQL(rows, height, chainId)}${
    upsert
      ? `,
                            on_conflict: {
                                constraint: ${table}_pkey,
                                update_columns: [${getColumns(rows)}]
                            }
                            `
      : ''
  }
            )
            {
                affected_rows
                ${
                  returnKeys.length !== 0
                    ? `returning {
                      ${returnKeys.join('\n')}
                    }`
                    : ''
                }
            }
    }
    `
  return graphQLQuery({ hasura_url, hasura_admin_key })(query)
}

const read = ({ hasura_url, hasura_admin_key }) => (schema) => async (
  table,
  queryName,
  keys,
  filter
) => {
  keys = Array.isArray(keys) ? keys : [keys]
  // schema could be set or not
  let schema_prefix = schema ? schema + '_' : ''

  const query = `
        query ${schema_prefix}${queryName} {
            ${schema_prefix}${table}${filter ? `(${filter})` : ''} {
                ${keys.join('\n')}
            }
        }
    `

  const res = await graphQLQuery({ hasura_url, hasura_admin_key })(query)
  return res.data[`${schema_prefix}${table}`]
}

module.exports = {
  insert,
  read,
  query: graphQLQuery
}
