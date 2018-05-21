<template lang='pug'>
.section-cover
  .section-cover__container
    .section-cover__name {{ text.zoneName }}
    .section-cover__logo
      i.material-icons(v-if="text.coverIcon") {{ text.coverIcon }}
      img(v-else src="~assets/images/badge-zone.png")
    .section-cover__tagline {{ text.zoneTagline }}
    .section-cover__scroll
      btn(icon="arrow_downward" v-scroll-to="'#section-benefits'")
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
export default {
  name: 'section-cover',
  components: {
    Btn
  },
  computed: { ...mapGetters(['text']) }
}
</script>

<style lang="stylus">
@require '~variables'

.section-cover
  height 100vh
  width 100vw
  display flex
  margin-top -3rem
  background app-fg url('~images/bg-zone.png') center center
  background-size cover
  border-bottom 1px solid bc-dim

.section-cover__container
  flex 1
  padding-top 3rem
  padding 0 2rem

  display flex
  flex-flow column nowrap
  align-items center
  justify-content center
  position relative

.section-cover__logo
  margin 5vh 0

  img
    width 50vw
    max-width 16rem
    max-height 16rem

  i.material-icons
    font-size 6rem
    color link

    width 10rem
    height 10rem
    border-radius 8rem
    background url('~images/badge-zone.png') center center
    background-size cover

    display flex
    align-items center
    justify-content center

.section-cover__name
.section-cover__tagline
  height 3rem

.section-cover__name
  font-size h1
  font-weight 500
  color bright

.section-cover__tagline
  text-align center
  font-weight 300
  letter-spacing 0.025em
  max-width 22rem
  font-size lg

.section-cover__scroll
  position absolute
  bottom 0.5rem
  right 0.5rem

.section-cover__scroll .ni-btn
  shadow()

@media screen and (min-width: 375px)
  .section-cover__logo
    i.material-icons
      width 11.72rem
      height 11.72rem

@media screen and (min-width: 414px)
  .section-cover__logo
    i.material-icons
      width 12.94rem
      height 12.94rem

@media screen and (min-width: 512px)
  .section-cover__logo
    i.material-icons
      width 16rem
      height 16rem
</style>
