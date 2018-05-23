<template lang="pug">
.download-links
  .bin.bin-tendermint
    .title
      img(src='~images/icon-tendermint.png')
    .key-value
      .key Tendermint Core
      .value
        btn(type='anchor', icon='link', value='View Releases' target="_blank"
          href="https://github.com/tendermint/tendermint/releases")
  .bin.bin-abci
    .title
      img(src='~images/icon-abci.png')
    .key-value
      .key ABCI
      .value
        btn(type='anchor', icon='link', value='View Releases' target="_blank"
          href="https://github.com/tendermint/abci/releases")
  .bin.bin-ethermint
    .title
      img(src='~images/icon-ethermint.png')
    .key-value
      .key Ethermint
      .value
        btn(type='anchor', icon='link', value='View Releases' target="_blank"
          href='https://github.com/tendermint/ethermint/releases')
</template>

<script>
import Btn from "@nylira/vue-button"
export default {
  name: "download-links",
  components: {
    Btn
  }
}
</script>

<style lang="stylus">
@require '~variables'

.download-links
  font-family sans
  font-size 1rem

  .bin
    margin-bottom 1rem
    display flex
    .title
      img
        display block
        width 4em
        height 4em
        margin 0

    .key-value
      flex 1
      padding 0 0.75em
      background var(--app-fg)
      display flex
      flex-flow column nowrap
      justify-content center

    .key, .value
      height 2rem
    .key
      line-height 2rem
      font-weight bold

@media screen and (min-width: 360px)
  .download-links
    .bin
      .value
        .ni-btn
          margin-right 0.375rem

@media screen and (min-width: 768px)
  .download-links
    .bin
      .title img
      .key-value
        height 6rem
      .title img
        width 6rem
      .key-value
        padding 0 1rem

@media screen and (min-width: 1024px)
  .download-links
    .bin
      .key-value
        padding 0 1.5rem
</style>
