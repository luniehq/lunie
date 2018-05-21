const state = {
  // SECTION: Links
  zoneGithub: 'https://github.com/tendermint/ethermint',
  zoneWebsiteGithub: 'https://github.com/cosmos/ethermint-zone',

  // SECTION: Site
  zoneName: 'Ethermint',
  zoneTagline: 'Scalable and interoperable Ethereum, built on Proof-of-Stake',
  siteTitle: 'Ethermint - A Cosmos Zone',
  siteDescription: 'Ethermint provides the same functionality as standard Ethereum. This means that all smart contracts, the EVM, all tooling, and client software work as expected. The difference is that Ethermint uses PoS instead of PoW. It provides instant finality as well as IBC compatibility.',

  // SECTION: Cover
  // coverIcon: 'crop_free',
  // if coverIcon not set, the app will use the image located at
  // ./src/assets/images/badge-zone.png

  // SECTION: Benefits
  benefitsTitle: 'Proof-of-Stake Ethereum',
  benefits: [
    {
      icon: 'zoom_out_map',
      title: 'Scalable',
      body: 'Ethermint is horizontally scalable to an unlimited number of machines through zones.'
    },
    {
      icon: 'settings_ethernet',
      title: 'IBC Compatible',
      body: 'Unleash the power of the EVM in connection to other blockchains with Cosmos IBC.'
    },
    {
      icon: 'flash_on',
      title: 'Blazing Speed',
      body: 'Ethermint block times are lightning quick with low latency and high throughput.'
    }
    /* {
      icon: 'mood',
      title: 'Benefit 4 (REPLACEME)',
      body: 'This is a really awesome benefit of this zone. (REPLACEME)'
    } */
    // you may add more benefits -- the site layout looks best with multiples of 3
  ]
}

export default {
  state
}
