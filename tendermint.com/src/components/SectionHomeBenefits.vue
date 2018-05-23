<template lang="pug">
ni-section.section-home-benefits
  .blocks
    .block
      i.material-icons storage
      .text
        .key Byzantine Fault-Tolerant
        .value Tendermint tolerates up to 1/3 of your machines failing arbitrarily. This includes explicitly malicious behaviour.
    .block
      i.material-icons content_copy
      .text
        .key State Machine Replication
        .value Tendermint can replicate deterministic state machines written in any programming language.
    .block
      i.material-icons lock
      .text
        .key Secure P2P
        .value Gossip protocols and peer discovery are secured via Tendermint's authenticated encryption system.
    .block
      i.material-icons flash_on
      .text
        .key Lightning Fast
        .value Tendermint supports thousands of transactions per second.
    .block
      i.material-icons cloud_upload
      .text
        .key Easy to Deploy
        .value Use mintnet to deploy your app to any cloud provider supported by docker-machine.
    .block
      i.material-icons code
      .text
        .key 100% Open Source
        .value All of Tendermint's source code is licensed under Apache 2.0. Check it out on #[a(:href='links.tm.github.organization', target='_blank') GitHub].
</template>

<script>
import { mapGetters } from "vuex"
import NiSection from "./NiSection"
export default {
  name: "section-home-benefits",
  components: {
    NiSection
  },
  computed: {
    ...mapGetters(["links"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.section-home-benefits
  .blocks
    padding-top x

  .block
    display flex
    margin-bottom 2*x
    padding 0 x

    i
      font-size 1.5*x
      display block

      width 3*x
      height 3*x

      display flex
      justify-content center
      align-items center
      color var(--txt)
      background var(--app-fg)
      border-radius 0.5rem

    .text
      flex 1
      padding 0 x

    .key
      margin 0 0 0.5*x
      font-weight 500

@media screen and (min-width: 360px)
  .section-home-benefits
    .block
      i
        width 3.5*x
        height 3.5*x
        font-size 1.75*x

      .text
        padding 0 1.5*x

@media screen and (min-width: 414px)
  .section-home-benefits
    .block
      i
        width 4*x
        height 4*x
        font-size 2*x

@media screen and (min-width: 768px)
  .section-home-benefits
    .blocks
      padding-top 2*x
    .block
      max-width 640px
      margin-left auto
      margin-right auto
      margin-bottom 3*x

      i
        width 5*x
        height 5*x

      .text
        padding-left 2rem
      .key
        font-size 1.25*x

@media screen and (min-width: 1024px)
  .section-home-benefits
    .blocks
      padding-top 3*x
      display flex
      flex-flow row wrap
      max-width 900px
      margin 0 auto
    .block
      flex 0 0 50%
      margin-bottom 4.5*x
      padding x
      i
        width 5*x
        height 5*x

@media screen and (min-width: 1280px)
  .section-home-benefits
    .blocks
      max-width 1080px
</style>
