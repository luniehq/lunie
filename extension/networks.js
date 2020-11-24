export default [
  {
    id: 'cosmos-hub-mainnet',
    chain_id: 'cosmoshub-3',
    title: 'Cosmos Hub',
    icon: `images/networks/atom.png`,
    api_url: 'https://lcd.nylira.net',
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
    chain_id: 'gaia-13007',
    title: 'Gaia Testnet',
    icon: `images/networks/atom.png`,
    api_url:
      'https://gaia-13007--lcd--archive.datahub.figment.io/apikey/950cdf50adf68fe53d7f784b11437c79',
    stakingDenom: 'MUON',
    testnet: true,
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
  },
  {
    id: 'terra-mainnet',
    chain_id: 'columbus-4',
    title: 'Terra',
    icon: `images/networks/luna.png`,
    api_url: 'https://lcd-terra.p2p.org',
    stakingDenom: 'LUNA',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'LUNA',
        chainDenom: 'uluna',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'terra',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'terra-testnet',
    chain_id: 'tequila-0004',
    title: 'Terra Testnet',
    icon: `images/networks/luna.png`,
    api_url: 'https://tequila-lcd.terra.dev',
    stakingDenom: 'LUNA',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'LUNA',
        chainDenom: 'uluna',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'terra',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'akash-mainnet',
    chain_id: 'akashnet-1',
    title: 'Akash',
    icon: `images/networks/akash.png`,
    api_url: 'http://lcd.akash.forbole.com:80',
    stakingDenom: 'AKT',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'AKT',
        chainDenom: 'uakt',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'akash',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'akash-testnet',
    chain_id: 'prenet-1',
    title: 'Akash Testnet',
    icon: `images/networks/akash.png`,
    api_url: 'http://lcd.akash-testnet.forbole.com',
    stakingDenom: 'AKT',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'AKT',
        chainDenom: 'uakt',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'akash',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'emoney-mainnet',
    chain_id: 'emoney-2',
    title: 'e-Money',
    icon: `images/networks/ngm.png`,
    api_url: 'https://emoney.validator.network/light',
    stakingDenom: 'NGM',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'NGM',
        chainDenom: 'ungm',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'eEUR',
        chainDenom: 'eeur',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'eCHF',
        chainDenom: 'echf',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'eSEK',
        chainDenom: 'esek',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'eNOK',
        chainDenom: 'enok',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'eDKK',
        chainDenom: 'edkk',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'emoney',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  {
    id: 'kava-mainnet',
    chain_id: 'kava-4',
    title: 'Kava',
    icon: `images/networks/kava.png`,
    api_url: 'http://lcd.kava.forbole.com',
    stakingDenom: 'KAVA',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'KAVA',
        chainDenom: 'ukava',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'BNB',
        chainDenom: 'bnb',
        chainToViewConversionFactor: 1e-6
      },
      {
        viewDenom: 'HARD',
        chainDenom: 'hard',
        chainToViewConversionFactor: 1e-6
      }
    ],
    address_prefix: 'kava',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519'
  },
  // POLKADOT NETWORKS
  {
    id: 'polkadot',
    chain_id: 'polkadot-cc1',
    title: 'Polkadot',
    icon: `images/networks/dot.png`,
    api_url: 'https://polkadot.polkastats.io/sidecar',
    stakingDenom: 'DOT',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'DOT',
        chainDenom: 'Planck',
        chainToViewConversionFactor: 1e-10
      }
    ],
    address_prefix: '0',
    network_type: 'polkadot',
    HDPaths: `[{"value":""}]`,
    curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"},{"value":"ecdsa", "name":"ECDSA curve"}]`,
    HDPath: `""`,
    curve: 'sr25519'
  },
  {
    id: 'kusama',
    chain_id: 'kusama-cc3',
    title: 'Kusama',
    icon: `images/networks/ksm.png`,
    api_url: 'https://kusama.polkastats.io/sidecar',
    stakingDenom: 'KSM',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'KSM',
        chainDenom: 'Planck',
        chainToViewConversionFactor: 1e-12
      }
    ],
    address_prefix: '0',
    network_type: 'polkadot',
    HDPaths: `[{"value":""}]`,
    curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"},{"value":"ecdsa", "name":"ECDSA curve"}]`,
    HDPath: `""`,
    curve: 'sr25519'
  },
  {
    id: 'polkadot-testnet',
    chain_id: 'westend',
    title: 'Polkadot Testnet',
    icon: `images/networks/wnd.png`,
    api_url: 'https://westend.polkastats.io/sidecar',
    stakingDenom: 'WND',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'WND',
        chainDenom: 'Planck',
        chainToViewConversionFactor: 1e-12
      }
    ],
    address_prefix: '0',
    network_type: 'polkadot',
    HDPaths: `[{"value":""}]`,
    curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"},{"value":"ecdsa", "name":"ECDSA curve"}]`,
    HDPath: `""`,
    curve: 'sr25519'
  }
]
