const state = {
  // SECTION: Links
  zoneGithub: 'https://github.com/cosmos/peggy',
  zoneWebsiteGithub: 'https://github.com/mossid/ether.peg.zone',

  // SECTION: Site
  zoneName: 'Peggy',
  zoneTagline: 'A gateway between Ethereum and Tendermint',
  siteTitle: 'Peggy - A Cosmos Zone',
  siteDescription: 'Peggy is a zone that any Cosmos zone can use to use ethers/ERC20s in them. Its 2-way peg design enables a secure & decentralized way to send assets from one chain to another',

  // SECTION: Cover
  // coverIcon: '',
  // if coverIcon not set, the app will use the image located at
  // ./src/assets/images/logo-zone.png

  // SECTION: Benefits
  benefitsTitle: 'Benefits of this Zone',
  benefits: [
    {
      icon: 'code',
      title: 'Served as single sdk module',
      body: 'Developers can simple include ETEnd module on their zone to use full features of Peggy'
    },
    {
      icon: 'compare_arrows',
      title: '2-way peg design',
      body: 'The funds are locked in the contract, no centralized authority can occupy them'
    },
    {
      icon: 'done_all',
      title: 'IBC based token sending',
      body: 'The tokens will be sent fast between the Cosmos zones'
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
