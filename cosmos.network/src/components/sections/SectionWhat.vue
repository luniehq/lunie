<template lang='pug'>
#section-what.section-home.section-what: .section-home__container
  .section-home__header What is Cosmos?
  .section-home__main
    .section-home__text
      .section-home__p Cosmos is a decentralized network of independent parallel blockchains, each powered by classical BFT consensus algorithms like #[a(href="https://tendermint.com" target="_blank") Tendermint].
      .section-home__p The first blockchain in the Cosmos Network is the Cosmos Hub, whose native token is the Atom. Cosmos is a permissionless network, meaning that anybody can build a blockchain on it.
    .section-home__diagrams
      .cosmos-diagram: .cosmos-diagram__container
        .cosmos-diagram__image: img.cosmos-diagram__img(
          src="images/diagrams/diagram-hub.png")
        .cosmos-diagram__label
          | A Hub is a blockchain that enables Zones to work together.
      .cosmos-diagram: .cosmos-diagram__container
        .cosmos-diagram__image: img.cosmos-diagram__img(
          src="images/diagrams/diagram-zones.png")
        .cosmos-diagram__label
          | Zones are sovereign blockchains that exchange value through Hubs. They can be private or public.
      .cosmos-diagram: .cosmos-diagram__container
        .cosmos-diagram__image: img.cosmos-diagram__img(
          src="images/diagrams/diagram-validators.png")
        .cosmos-diagram__label
          | #[router-link(:to="{ name: 'validators' }") Validators] are responsible for committing new blocks and ensuring that consensus is reached.
      .cosmos-diagram: .cosmos-diagram__container
        .cosmos-diagram__image: img.cosmos-diagram__img(
          src="images/diagrams/diagram-atoms.png")
        .cosmos-diagram__label
          | #[router-link(:to="{ name: 'faq' }") Atoms] are a license for holders to stake and vote on the Cosmos Hub.
    .section-home__action
      router-link(:to="{ name: 'intro'}") Introduction to Cosmos &rsaquo;
</template>

<script>
export default {
  name: "section-what"
}
</script>

<style lang="stylus">
@require '~variables'

.section-home
  background linear-gradient(top, app-bg, app-fg)

.section-home__container
  padding 3rem 1rem
  max-width 1024px
  margin 0 auto
  overflow hidden

.section-home__header
.section-home__diagrams
  margin-bottom 1.5rem

  &:last-child
    margin-bottom 0

.section-home__header
  font-size h1
  color bright
  font-weight 500
  margin-bottom 1.5rem
  text-align center

.section-home__text
.section-home__p
  max-width 34rem
  margin-left auto
  margin-right auto

.section-home__p
  margin-bottom 1.5rem
  &:last-child
    margin-bottom 0

.section-home__action
  display block
  text-align center

.section-home__diagrams
  margin -0.5rem
  display flex
  align-items center
  flex-flow column nowrap

.cosmos-diagram
  display flex
  max-width 34rem + 1rem

.cosmos-diagram__container
  flex 1
  background app-bg
  display flex
  flex-flow row nowrap
  align-items center
  margin 0.5rem

.cosmos-diagram__image
  flex 1
  padding 1rem

.cosmos-diagram__img
  width 7rem

.cosmos-diagram__label
  padding 1rem
  padding-left 0

@media screen and (min-width: 768px)
  .section-home__container
    padding 4rem 1rem

  .section-home__text
    margin-bottom 3rem

  .section-home__header
  .section-home__diagrams
    margin-bottom 2rem

  .cosmos-diagram__img
    width 10rem

  .cosmos-diagram__label
    padding-left 1rem

@media screen and (min-width: 1024px)
  .section-home__diagrams
    flex-flow row nowrap

  .cosmos-diagram
    flex 1

  .cosmos-diagram__container
    display block

  .cosmos-diagram__image
    text-align center

  .cosmos-diagram__label
    flex 1
    display block
    text-align center
    height 9rem
</style>
