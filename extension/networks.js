export default [{
    id: 'cosmos-hub-mainnet',
    chain_id: 'cosmoshub-3',
    title: 'Cosmos Hub',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
    website: 'https://cosmos.network',
    api_url: 'https://lcd.nylira.net',
    stakingDenom: 'ATOM',
    slug: 'cosmos-hub',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'ATOM',
        chainDenom: 'uatom',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'cosmos',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519',
    lockUpPeriod: `21 days`,
    fees: {
      default: {
        gasEstimate: 350000,
        feeOptions: [
          {
            denom: 'ATOM',
            amount: 0.1,
          },
        ],
      },
    },
  }]
  