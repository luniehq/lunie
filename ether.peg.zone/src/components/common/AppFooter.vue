<template lang="pug">
.app-footer
  section-community
  .footbot: .footbot__container
    .footbot__text &copy; {{ new Date().getFullYear() }} {{ text.zoneName }}
    a.footbot__text(href="https://cosmos.network" target="_blank") A Cosmos Zone
</template>

<script>
import {mapGetters} from 'vuex'
import SectionCommunity from 'sections/SectionCommunity'
export default {
  name: 'app-footer',
  components: {
    SectionCommunity
  },
  computed: {
    ...mapGetters(['text'])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.footbot__container
  max-width 1024px
  margin 0 auto

.footbot
  background app-fg

.footbot__container
  display flex
  flex-flow row wrap
  max-width 1024px
  margin 0 auto

.footbot__text
  line-height 3rem
  padding 0 1rem

.footbot__img
  max-width 50vw

.footbot-menu
  padding 1.5rem
  flex 0 0 50%

.footbot-menu__title
  color bright
  line-height 2rem

.footbot-menu__items
  display flex
  flex-flow column nowrap

.footbot-menu__item
  line-height 2rem

@media screen and (min-width: 768px)
  .footbot__container
    padding 1.5rem 0

  .footbot__text
    flex 0 0 50%
    padding 0 2rem

  a.footbot__text
    text-align right
    
  .footbot__img
    max-width 14rem

  .footbot-menu
    flex 0 0 16.66667%

  .footbot-menu__title
    margin-bottom 1rem
</style>
