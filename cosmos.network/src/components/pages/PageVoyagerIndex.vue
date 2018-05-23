<template lang="pug">
.page-voyager-index
  .voyager-cover
    .voyager-cover__container
      .voyager-cover__title Explore the Cosmos with Voyager.
      .voyager-cover__subtitle The user interface for the Cosmos Network. Built to scale to infinity and beyond.
      btn.voyager-cover__action(size="lg" icon="cloud_download" value="Download Alpha" type="anchor" href="https://github.com/cosmos/voyager/releases" color="primary")

  .voyager-section.voyager-section-benefits: .voyager-section__container
    .voyager-section__header
      .voyager-section__title What is Voyager?
      .voyager-section__subtitle Voyager is a secure desktop app for the Cosmos Network. #[router-link(:to="{name: 'roadmap'}") At launch], you will be able to use it to store, bond, and manage your Atoms and other Cosmos tokens.
    .voyager-section-main: .card-features
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons lock
        .card-feature__text
          .card-feature__title Store IBC Tokens
          .card-feature__subtitle [Coming Soon] Store IBC-supported tokens&mdash;like Atoms and Photons&mdash;from the Cosmos Hub, #[a(href="https://ethermint.zone") Ethermint Zone], #[a(href="https://ether.peg.zone") Peggy Zone], and any future Cosmos Zones.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons swap_horiz
        .card-feature__text
          .card-feature__title Exchange IBC Tokens
          .card-feature__subtitle Send and receive #[a(href="https://blog.cosmos.network/developer-deep-dive-cosmos-ibc-5855aaf183fe") IBC-supported tokens] to other Voyager users through the Cosmos Hub. Stay up to date with the transaction history.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons search
        .card-feature__text
          .card-feature__title Examine Validators
          .card-feature__subtitle View detailed information on the current set of #[router-link(:to="{name: 'validators'}") Cosmos Validators], aka the top 100 stakeholders of the Cosmos Network.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons attach_money
        .card-feature__text
          .card-feature__title Earn Staking Income
          .card-feature__subtitle [Coming Soon] Bond your Atoms to Cosmos Validators through the bonding interface and earn staking income in #[a(href="https://blog.cosmos.network/cosmos-fee-token-introducing-the-photon-8a62b2f51aa") Photons] every block.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons widgets
        .card-feature__text
          .card-feature__title Explore Blocks
          .card-feature__subtitle Step through every block of the Cosmos Hub since genesis. Debug your application by viewing transactions, signatures, etc. per block.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons update
        .card-feature__text
          .card-feature__title Change the Future
          .card-feature__subtitle [Coming Soon] With the #[router-link(:to="{name: 'roadmap'}") launch of the Cosmos Hub] you will be able to create and vote on proposals affecting the future of the Cosmos Network.

  .voyager-section.voyager-section-development: .voyager-section__container
    .voyager-section__header
      .voyager-section__title Voyager Development Toolkit
      .voyager-section__subtitle Future releases of Voyager will allow developers to extend it with plugins. Whether you'd like create your own cryptocurrency, distributed exchange, or develop a blockchain-based game, it will be easy to build it as a Voyager plugin.
    .voyager-section-main: .card-features
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons language
        .card-feature__text
          .card-feature__title Built with Web Tech
          .card-feature__subtitle Voyager is built on top of #[a(href="https://electronjs.org/") Electron], a battle-tested cross-platform development framework. It lets us build Voyager for Windows, macOS, and Linux with standard web tech like Javascript, HTML and CSS.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons settings_input_component

        .card-feature__text
          .card-feature__title Extend with Plugins
          .card-feature__subtitle The core features of Voyager is designed to be a foundation for further development. Our goal is to let anyone extend Voyager with support for new Cosmos Zones, plugins, and automation.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons settings_ethernet
        .card-feature__text
          .card-feature__title IBC Compatible
          .card-feature__subtitle Any proposed Cosmos Zone that's accepted into the Cosmos Hub is instantly integrated into Voyager. Learn how to build your own IBC-powered zone on the #[router-link(:to="{name: 'developers'}") Developers page].
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons color_lens
        .card-feature__text
          .card-feature__title Vue UI Library
          .card-feature__subtitle To keep the experience consistent for Voyager users and simplify your development workflow, we have developed a flexible UI library based on #[a(href="https://vuejs.org/") Vue] that you can use to quickly build Voyager plugins.

  .voyager-section.voyager-section-interface: .voyager-section__container
    .voyager-section__header
      .voyager-section__title Voyager UI Library
      .voyager-section__subtitle [Coming Soon] Using components from the Voyager UI library, you can quickly scaffold up your own Voyager plugin. If you're feeling ambitious, you can fork Voyager to create a UI for your own Cosmos Hub.
    .voyager-section-main: .card-features
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons web
        .card-feature__text
          .card-feature__title Rapid Prototyping
          .card-feature__subtitle UI components in Voyager are plug and play. Quickly mockup the functionality of your plugin by copying and pasting a few lines of code and adjusting some parameters.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons view_compact
        .card-feature__text
          .card-feature__title Designed UI Components
          .card-feature__subtitle You won't need to hire a designer to come up with a great user interface design. We'll provide you with the UI framework and components to make your project fit into the Cosmos Network.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons colorize
        .card-feature__text
          .card-feature__title Custom Theme Support
          .card-feature__subtitle You'll be able to customize the theme for any UI component in Voyager. Imagine setting five different colors to instantly update the entire UI library.
      .card-feature: .card-feature__container
        .card-feature__icon: i.material-icons grade
        .card-feature__text
          .card-feature__title Ultimate Flexibility
          .card-feature__subtitle Want to create an entirely custom experience for your Cosmos Zone? You can do that. Everything allowed in JS, HTML, and JS is allowed in plugin creation.

  .voyager-section.voyager-section-download: .voyager-section__container
    .voyager-section__header
      .voyager-section__title Download Voyager
      .voyager-section__subtitle Download and install the latest version of Voyager for your operating system.
    .voyager-section-main: .card-downloads
      .card-download
        .card-download__title Windows
        .card-download__subtitle 64-bit
        btn(icon="cloud_download" value="Download" color="primary" type="anchor" href="https://github.com/cosmos/voyager/releases")
      .card-download
        .card-download__title macOS
        .card-download__subtitle 64-bit
        btn(icon="cloud_download" value="Download" color="primary" type="anchor" href="https://github.com/cosmos/voyager/releases")
      .card-download
        .card-download__title Linux
        .card-download__subtitle 64-bit
        btn(icon="cloud_download" value="Download" color="primary" type="anchor" href="https://github.com/cosmos/voyager/releases")
</template>

<script>
import Page from "common/NiPage"
import Btn from "@nylira/vue-button"
import TextContainer from "common/NiTextContainer.vue"
export default {
  name: "page-voyager-index",
  metaInfo: { title: "Voyager Overview" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>

<style lang="stylus">
@require '~variables'

.voyager-cover
  background app-fg

.voyager-cover__container
  padding 3rem 1.5rem
  max-width 1024px
  margin 0 auto

  display flex
  flex-flow column nowrap
  align-items center

.voyager-cover__title
.voyager-cover__subtitle
  text-align center

.voyager-cover__title
  max-width 24rem
.voyager-cover__subtitle
  max-width 30rem

.voyager-cover__title
  font-size h1
  line-height 1.125
  font-weight 500
  margin-bottom 1.5rem
  color bright

.voyager-cover__subtitle
  font-size h3
  color dim
  margin-bottom 3rem

.voyager-section
  border-top 1px solid bc

.voyager-section__container
  max-width 64rem
  margin 0 auto
  padding 2rem 1rem

.voyager-section__header
  margin-bottom 2rem
  display flex
  flex-flow column nowrap
  align-items center

.voyager-section__title
.voyager-section__subtitle
  text-align center
  max-width 40em

.voyager-section__title
  font-size h2
  font-weight 500
  margin-bottom 0.5rem
  color bright

.voyager-section__subtitle
  color dim

.card-feature
.card-download
  margin-bottom 1rem
  &:last-of-type
    margin-bottom 0

.card-feature__container
.card-download
  border 2*px solid bc
  padding 1rem
  border-radius 0.25rem

.card-feature
  display flex

.card-feature__container
  flex 1
  display flex

.card-feature__icon
  margin-left -1rem
  margin-right 1rem
  i.material-icons
    font-size 1.5em
    height 3rem
    width 3rem
    display flex
    align-items center
    justify-content center
    color txt
    background bc

.card-feature__text
  flex 1

.card-feature__title
  font-size h4
  font-weight 500
  margin-bottom 0.25rem

.card-feature__subtitle
  font-size sm
  color dim

.card-download
  display flex
  flex-flow column nowrap
  align-items center

.card-download__title
.card-download__subtitle
  text-align center
.card-download__title
  font-weight 500
  font-size lg
.card-download__subtitle
  color dim
  margin-bottom 1rem

@media screen and (min-width: 768px)
  .voyager-section__container
    padding-top 3rem
    padding-bottom 3rem

  .voyager-section__subtitle
    font-size lg

  .card-features
  .card-downloads
    display flex
    padding 0.5rem

  .card-features
    flex-flow row wrap

  .card-downloads
    flex-flow row nowrap

  .card-feature__container
  .card-download
    margin 0.5rem
    &:last-of-type
      margin 0.5rem

  .card-feature
  .card-download
    margin-bottom 0
    &:last-of-type
      margin-bottom 0

  .card-feature
    flex 0 0 50%

  .card-feature__title
    margin-bottom 0.5rem

  .card-feature__subtitle
    font-size x

  .card-download
    flex 1

@media screen and (min-width: 1280px)
  .voyager-section
    padding-left 0
    padding-right 0

  .card-features
  .card-downloads
    margin 0 -1rem
</style>
