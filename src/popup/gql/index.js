/* istanbul ignore file */

import gql from 'graphql-tag'

export const schemaMap = {
  cosmoshub: '',
  [`gaia-testnet`]: 'gaia_testnet_',
  testnet: 'gaia_testnet_'
}

export const Networks = gql`
  query Networks {
    networks {
      id
      chain_id
      testnet
      title
      rpc_url
    }
  }
`
