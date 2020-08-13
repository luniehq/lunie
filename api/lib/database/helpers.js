const fetch = require('node-fetch')
const escape = require('escape-html')
const Sentry = require('@sentry/node')

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
  })
    .then(async (response) => {
      if (!response.ok)
        throw new Error(response.status + ' ' + (await response.text()))
      else return response.json()
    })
    .catch((error) => {
      console.error(error, query)
      throw new Error('GraphQL query failed')
    })

  if (data.errors || data.error) {
    console.error('Query failed:', query)
    const errors = data.errors || [data.error]
    errors.forEach((error) => {
      console.error(error.message)
      console.error(error.hint)
    })
    throw new Error('GraphQL query failed')
  }

  return data
}

function escapeObject(value) {
  if (value === undefined || value === null) return ''
  if (typeof value === 'boolean' || typeof value === 'number') {
    return value
  }
  if (typeof value === 'object') {
    const clone = JSON.parse(JSON.stringify(value))
    Object.keys(clone).forEach((key) => {
      clone[key] = escapeObject(clone[key])
    })
    return clone
  } else {
    return escape(value)
  }
}

function escapeValue(value) {
  return value === undefined || value === null
    ? `""`
    : typeof value === 'boolean' || typeof value === 'number'
    ? value
    : typeof value === 'string'
    ? `"${escape(value)}"`
    : // we need to double stringify to double escape the quotations
      // if not, inserted in the query the object will have double quotes inside
      JSON.stringify(JSON.stringify(escapeObject(value)))
}

function gqlKeyValue([key, value]) {
  // escape all values but handle objects gracefully
  return `${key}: ${escapeValue(value)}`
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
  const response = await graphQLQuery({ hasura_url, hasura_admin_key })(query)
  // return the inserted object
  if (returnKeys.length > 0) {
    return response.data[`insert_${schema_prefix}${table}`].returning
  }
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

  try {
    const res = await graphQLQuery({ hasura_url, hasura_admin_key })(query)
    return res.data[`${schema_prefix}${table}`]
  } catch (error) {
    console.error('DB read failed for query', query, error)
    Sentry.withScope(function (scope) {
      scope.setExtra('query', query)
      Sentry.captureException(error)
    })
  }
}

module.exports = {
  insert,
  read,
  query: graphQLQuery,
  escapeValue: escapeObject,
  gqlKeyValue
}
