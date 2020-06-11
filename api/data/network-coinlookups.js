const terraCoinLookup = [
  {
    chainDenom: 'uluna',
    viewDenom: 'LUNA',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'ukrw',
    viewDenom: 'KRT',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'ukrw',
    viewDenom: 'KRT',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'umnt',
    viewDenom: 'MNT',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'usdr',
    viewDenom: 'SDT',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'uusd',
    viewDenom: 'UST',
    chainToViewConversionFactor: 1e-6
  }
]
// in the case of e-Money, some tokens only exist in mainnet and viceversa, some tokens only exist in testnet
// still, this will probably soon change with the new testnet
// also it is just more simple to add them all in the same dictionary
const emoneyCoinLookup = [
  {
    chainDenom: 'ungm',
    viewDenom: 'NGM',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'edkk',
    viewDenom: 'eDKK',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'enok',
    viewDenom: 'eNOK',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'esek',
    viewDenom: 'eSEK',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'echf',
    viewDenom: 'eCHF',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'eeur',
    viewDenom: 'eEUR',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'eusd',
    viewDenom: 'eUSD',
    chainToViewConversionFactor: 1e-6
  },
  {
    chainDenom: 'ejpy',
    viewDenom: 'eJPY',
    chainToViewConversionFactor: 1e-6
  }
]
const coinLookupDictionary = {
  "cosmos-hub-mainnet": [{
      chainDenom: 'uatom',
      viewDenom: 'ATOM',
      chainToViewConversionFactor: 1e-6
  }],  
  "cosmos-hub-testnet": [{
      chainDenom: 'umuon',
      viewDenom: 'MUON',
      chainToViewConversionFactor: 1e-6
  }],  
  "terra-mainnet": terraCoinLookup, 
  "terra-testnet": terraCoinLookup,
  "emoney-mainnet": emoneyCoinLookup,
  "emoney-testnet": emoneyCoinLookup,
  "kusama": [{
      chainDenom: 'Planck',
      viewDenom: 'KSM',
      chainToViewConversionFactor: 1e-12
  }],
  "polkadot": [{
      chainDenom: 'Planck',
      viewDenom: 'DOT',
      chainToViewConversionFactor: 1e-12
  }],
  "kava-mainnet": [{
    chainDenom: 'ukava',
    viewDenom: 'KAVA',
    chainToViewConversionFactor: 1e-6
  }],
  "kava-testnet": [{
    chainDenom: 'ukava',
    viewDenom: 'KAVA',
    chainToViewConversionFactor: 1e-6
  }],
  "akash-testnet": [{
    chainDenom: 'uakt',
    viewDenom: 'AKT',
    chainToViewConversionFactor: 1e-6
  }]
}

module.exports = {coinLookupDictionary}