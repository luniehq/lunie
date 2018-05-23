<template lang="pug">
.page-index

  #cover
    h1: img(src='~img/interchain-logo-horizontal.png', alt='Interchain - The Internet of Blockchains')
    img#more-arrow(src='~img/arrow.png', v-scroll-to="'#first-section'")

  section#first-section
    header.section-header: h2 Interchain Mission
    img.desktop(src='~img/interchain-logo-vertical.png', alt='Interchain - The Internet of Blockchains')
    p Blockchain technology offers the potential to make the world a more transparent, fair, efficient and innovative place. From banks working on upgrading decades-old legacy infrastructure, to NGOs pushing for more transparent supply chains to cryptocurrency startups building financial services for the unbanked, blockchains can be the technological foundation on which that change is made possible.
    p But the truth is that the blockchain technologies being used today still suffer from core weaknesses and these weaknesses are obstacles to applications running on blockchains reaching their full potential. Blockchains today operate in silos with only limited ability for systems to interoperate, upgradability in decentralized networks is difficult and the scalability provided will not meet tomorrow's needs.
    p The Interchain Foundation was founded to solve these problems by helping to facilitate the next generation of blockchain technology. The foundations goal is to build an Internet of Blockchains, where interoperability and scalability can be taken for granted, for even the most complex and high volume applications. This project is called Cosmos.

  // a.banner(href='https://cosmos.network'): img(src="~img/banner.png")

  section
    header.section-header
      h2.img: img(src='~img/cosmos-wordmark.png', alt='Cosmos')
      img.strip(src='~img/strip.png')
    img.desktop(src='~img/cosmos-brandmark.jpg', alt='Cosmos - The Internet of Blockchains')
    p Cosmos, the first project of the Interchain Foundation, has an ambitious mission: to create a network of distributed ledgers that will solve several long-standing problems in the cryptocurrency and blockchain communities.
    p Consisting of many independent, parallel blockchains, called zones, the Cosmos Network allows each zone to interoperate through a shared hub. The Cosmos Hub, the first blockchain in the Cosmos network, connects to zones through the IBC (Inter-Blockchain Communication) protocol, which keeps a constant record of the total number of tokens in each zone.
    p Cosmos has been built to support a variety of currencies and scripting languages like those found in Bitcoin, Ethereum, ZeroCash, CryptoNote, and more. As all inter-zone token transfers go through the Cosmos Hub, you can transfer tokens from one zone to another, quickly and securely and without the need for a liquid exchange or a trusted third party.

    a.btn(href='https://cosmos.network') Find Out More

  footer
    img(src='~img/interchain-logo-vertical.png', alt='Interchain - The Internet of Blockchains')
    p#copyright &copy; {{ new Date().getFullYear() }}, Interchain Foundation Ltd. All rights reserved.
</template>

<script>
export default {
  name: 'page-index',
  metaInfo: {
    title: 'Interchain Foundation - Internet of Blockchains',
    titleTemplate: null
  }
}
</script>
