export default [
  {
    id: 'cosmos-hub-mainnet',
    chain_id: 'cosmoshub-3',
    title: 'Cosmos Hub',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
    stakingDenom: 'ATOM',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'ATOM',
        chainDenom: 'uatom',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'cosmos',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'cosmos-hub-testnet',
    chain_id: 'stargate-4',
    title: 'Cosmos Stargate',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
    stakingDenom: 'MUON',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'MUON',
        chainDenom: 'umuon',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'cosmos',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  }
]
