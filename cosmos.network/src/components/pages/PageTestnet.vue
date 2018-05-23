<template lang="pug">
mixin user-btns(size)
  btn(value="Download Voyager (Alpha)" icon="cloud_download" color="primary" type="anchor" href="https://github.com/cosmos/voyager/releases" size=size)
  btn(value="Learn More" type="link" :to="{ name: 'voyager' }" size=size)

mixin validator-btns(size)
  btn(value="Follow Testnet Tutorial" icon="description" color="primary" type="link" :to="{ name: 'testnet-tutorial' }" size=size)
  btn(value="Learn More" type="link" :to="{ name: 'validators' }" size=size)

.page-testnet
  .testnet-header
    .testnet-header__title Joining the Testnet
    .testnet-header__subtitle Are you a user or a validator?
  .testnet-options
    .testnet-option
      .testnet-option__title User
      .testnet-option__subtitle
        | I wish to try using Voyager, the wallet for Cosmos tokens.
      .testnet-option__main.desktop: +user-btns("lg")
      .testnet-option__main.mobile: +user-btns()
    .testnet-option
      .testnet-option__title Validator
      .testnet-option__subtitle
        | I wish to participate in the testnet as a validator.
      .testnet-option__main.desktop: +validator-btns("lg")
      .testnet-option__main.mobile: +validator-btns()
</template>

<script>
import Btn from "@nylira/vue-button"
export default {
  name: "page-testnet",
  metaInfo: { title: "Testnet" },
  components: { Btn },
  computed: {},
  data: () => ({}),
  methods: {},
  mounted() {},
  watch: {}
}
</script>

<style scoped lang="stylus">
@import '~variables'

.page-testnet
  max-width 1024px
  margin 0 auto

.testnet-header
  text-align center
  padding 1.5rem

.testnet-header__title
  font-size 2rem
  font-weight 500
  line-height 1.25
  color bright

.testnet-header__subtitle
  color dim
  font-size 1.25rem

.testnet-option
  padding 1rem
  border-top 1px solid var(--bc)

.testnet-option__title
  font-weight 500
  font-size 1.5rem
  color bright

.testnet-option__subtitle
  color dim
  margin 0 0 1rem

.testnet-option__main
  .ni-btn
    width 100%
  .ni-btn:first-child
    margin-bottom 0.5rem

.testnet-option__main.desktop
  display none

@media screen and (min-width: 768px)
  .page-testnet
    margin-bottom 4.5rem

  .testnet-header
    padding 3rem
  .testnet-header__title
    font-size 2.5rem
    margin-bottom 0.5rem
  .testnet-header__subtitle
    font-size 1.5rem

  .testnet-options
    display flex
    flex-flow row nowrap

  .testnet-option
    flex 1
    padding 3rem
    border none
    background var(--app-fg)
    &:first-of-type
      margin-right 0.5rem
    &:last-of-type
      margin-left 0.5rem

  .testnet-option
    display flex
    flex-flow column nowrap

  .testnet-option__title
    font-size 2rem

  .testnet-option__subtitle
    flex 1
    margin-bottom 1.5rem

  .testnet-option__main
    .ni-btn:first-child
      margin-bottom 1rem

  .testnet-option__main.desktop
    display block
  .testnet-option__main.mobile
    display none

</style>
