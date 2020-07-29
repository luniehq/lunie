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

// load all the data immediatly to avoid async loading later
export const NetworksAll = gql`
  query Networks($experimental: Boolean) {
    networks(experimental: $experimental) {
      id
      chain_id
      testnet
      title
      icon
      slug
      default
      powered {
        name
        providerAddress
        picture
      }
      stakingDenom
      network_type
      address_prefix
      testnet
      coinLookup {
        chainDenom
        viewDenom
        chainToViewConversionFactor
      }
      rpc_url
      HDPaths
      curves
      defaultHDPath
      defaultCurve
    }
  }
`
