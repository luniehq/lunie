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
  },
  {
    id: 'cosmos-hub-testnet',
    chain_id: 'gaia-13007',
    title: 'Gaia Testnet',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/cosmos.png`,
    website: 'https://cosmos.network',
    api_url: 'https://gaia-13007--lcd--archive.datahub.figment.io/apikey/950cdf50adf68fe53d7f784b11437c79',
    stakingDenom: 'MUON',
    slug: 'cosmos-hub-testnet',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'MUON',
        chainDenom: 'umuon',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'cosmos',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519',
    lockUpPeriod: `3 days`,
    fees: {
      default: {
        gasEstimate: 350000,
        feeOptions: [
          {
            denom: 'MUON',
            amount: 0.1,
          },
        ],
      },
    },
  },
  {
    id: 'terra-mainnet',
    chain_id: 'columbus-4',
    title: 'Terra',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/terra.png`,
    website: 'https://terra.money',
    api_url: 'https://lcd-terra.p2p.org',
    stakingDenom: 'LUNA',
    slug: 'terra',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'LUNA',
        chainDenom: 'uluna',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'terra',
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
            denom: 'LUNA',
            amount: 0.0535,
          },
          {
            denom: 'KRT',
            amount: 63,
          },
          {
            denom: 'MNT',
            amount: 0.045,
          },
          {
            denom: 'SDT',
            amount: 0.01,
          },
          {
            denom: 'UST',
            amount: 0.015,
          },
        ],
      },
    },
  },
  {
    id: 'terra-testnet',
    chain_id: 'tequila-0004',
    title: 'Terra Testnet',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/terra.png`,
    website: 'https://terra.money',
    api_url: 'https://tequila-lcd.terra.dev',
    stakingDenom: 'LUNA',
    slug: 'terra-testnet',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'LUNA',
        chainDenom: 'uluna',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'terra',
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
            denom: 'LUNA',
            amount: 0.0535,
          },
          {
            denom: 'KRT',
            amount: 63,
          },
          {
            denom: 'MNT',
            amount: 0.045,
          },
          {
            denom: 'SDT',
            amount: 0.01,
          },
          {
            denom: 'UST',
            amount: 0.015,
          },
        ],
      },
    },
  },
  {
    id: 'akash-mainnet',
    chain_id: 'akashnet-1',
    title: 'Akash',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/akash.png`,
    website: 'https://akash.network/',
    api_url: 'http://lcd.akash.forbole.com:80',
    stakingDenom: 'AKT',
    slug: 'akash',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'AKT',
        chainDenom: 'uakt',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'akash',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519',
    lockUpPeriod: `21 days`,
    fees: {
      default: {
        gasEstimate: 550000,
        feeOptions: [
          {
            denom: 'AKT',
            amount: 0.01,
          },
        ],
      },
    },
  },
  {
    id: 'akash-testnet',
    chain_id: 'prenet-1',
    title: 'Akash Testnet',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/akash.png`,
    website: 'https://akash.network/',
    api_url: 'http://lcd.akash-testnet.forbole.com',
    stakingDenom: 'AKT',
    slug: 'akash',
    testnet: true,
    coinLookup: [
      {
        viewDenom: 'AKT',
        chainDenom: 'uakt',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'akash',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519',
    lockUpPeriod: `21 days`,
    fees: {
      default: {
        gasEstimate: 550000,
        feeOptions: [
          {
            denom: 'AKT',
            amount: 0.01,
          },
        ],
      },
    },
  },
  {
    id: 'emoney-mainnet',
    chain_id: 'emoney-2',
    title: 'e-Money',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/emoney.png`,
    website: 'https://e-money.com/',
    api_url: 'https://emoney.validator.network/light',
    stakingDenom: 'NGM',
    slug: 'emoney',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'NGM',
        chainDenom: 'ungm',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'eEUR',
        chainDenom: 'eeur',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'eCHF',
        chainDenom: 'echf',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'eSEK',
        chainDenom: 'esek',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'eNOK',
        chainDenom: 'enok',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'eDKK',
        chainDenom: 'edkk',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'emoney',
    network_type: 'cosmos',
    HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
    curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
    HDPath: `m/44'/118'/0'/0/0`,
    curve: 'ed25519',
    lockUpPeriod: `21 days`,
    fees: {
      default: {
        gasEstimate: 100000,
        feeOptions: [
          {
            denom: 'NGM',
            amount: 0.001,
          },
        ],
      },
    },
  },
  {
    id: 'kava-mainnet',
    chain_id: 'kava-4',
    title: 'Kava',
    icon: `https://lunie.fra1.digitaloceanspaces.com/network-icons/kava.png`,
    website: 'https://www.kava.io',
    api_url: 'http://lcd.kava.forbole.com',
    stakingDenom: 'KAVA',
    slug: 'kava',
    testnet: false,
    coinLookup: [
      {
        viewDenom: 'KAVA',
        chainDenom: 'ukava',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'BNB',
        chainDenom: 'bnb',
        chainToViewConversionFactor: 1e-6,
      },
      {
        viewDenom: 'HARD',
        chainDenom: 'hard',
        chainToViewConversionFactor: 1e-6,
      },
    ],
    address_prefix: 'kava',
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
            denom: 'KAVA',
            amount: 0.1,
          },
        ],
      },
    },
  },
]

  