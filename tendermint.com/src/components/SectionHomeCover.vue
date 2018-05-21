<template lang="pug">
section.section-home-cover
  img.section-home-logo(src='../assets/images/logo-blue-alpha-2048.png')
  .section-container
    section-home-cover-alert
    h1 Tendermint
    p.introduction Byzantine-fault tolerant state machine replication. Or blockchain, for short.
    .btns
      btn(type='link' :to="{ name: 'downloads' }" size='lg' icon='cloud_download' color='primary' value='Download')
      btn(target='_blank' type='anchor' href='https://riot.im/app/#/group/+cosmos:matrix.org' size='lg' icon='chat' value='Join Chat')
</template>

<script>
import { mapGetters } from "vuex"
import SectionHomeCoverAlert from "comp/SectionHomeCoverAlert.vue"
import Btn from "@nylira/vue-button"
export default {
  components: {
    SectionHomeCoverAlert,
    Btn
  },
  computed: {
    ...mapGetters(["links"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.section-home-cover
  position relative
  border-bottom 1px solid var(--bc)
  margin-top -3rem

  .section-container
    margin-top 3rem
    padding 3*x 1.5*x
    position relative

  h1
    color var(--bright)
    font-weight 700
    line-height 1
    font-size 2.75*x
    margin-bottom 2*x

  .introduction
    color var(--dim)
    max-width 20*x
    font-size 1.25*x
    margin-bottom 3*x

  .btns
    margin-bottom x
    &:last-of-type
      margin-bottom 0
    .ni-btn
      width 100%
      margin-bottom 0.5*x
      max-width 18*x

.section-home-logo
  display none

@media screen and (min-width: 360px)
  .section-home-cover .section-container
    padding 3*x 1.75*x

@media screen and (min-width: 414px)
  .section-home-cover .section-container
    padding 3*x 2.25*x

    h1
      font-size 3*x
    .tagline
      font-size 1.095*x

@media screen and (min-width: 768px)
  .section-home-cover .section-container
    padding 4*x 2*x
    max-width 640px
    margin-left auto
    margin-right auto

    .introduction
      font-size 1.5*x
      max-width 28*x

    .btns
      margin-bottom 1.5*x
      display flex
      flex-flow row nowrap
      max-width 32*x
      .ni-btn
        margin 0
        margin-right x

  .section-home-cover
    overflow hidden

  .section-home-logo
    display block
    width 80vw
    height 80vw
    position absolute
    top -2.5vw
    right -20vw
    opacity 0.05

@media screen and (min-width: 1024px)
  .section-home-cover .section-container
    max-width 900px
    .tagline
      margin-bottom 3*x
    .introduction
      margin-bottom 4*x

  .section-home-logo
    top -7.5vw
    right -20vw

@media screen and (min-width: 1280px)
  .section-home-cover .section-container
    padding 5*x 2*x 6*x
    max-width 1080px

  .section-home-logo
    width 70vw
    height 70vw

@media screen and (min-width: 1680px)
  .section-home-logo
    top -15vw
    right -15vw
</style>
