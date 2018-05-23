<template lang='pug'>
#section-benefits.section-home.section-home-benefits: .section-home__container
  .section-home__header
    .section-home__title {{ text.benefitsTitle }}
    .section-home__subtitle {{ text.siteDescription }}
  .section-home__main
    .ni-panels: panel(
      v-for="i in text.benefits"
      :key="i.title"
      :icon="i.icon"
      :title="i.title"
      :body="i.body")
</template>

<script>
import Panel from 'common/NiPanel'
import {mapGetters} from 'vuex'
export default {
  name: 'section-benefits',
  components: {
    Panel
  },
  computed: { ...mapGetters(['text']) }
}
</script>

<style lang="stylus">
@require '~variables'

.section-home__container
  padding 2rem 1rem
  max-width 1024px
  margin 0 auto
  overflow hidden

.section-home__header
.section-home__text
.section-home__diagrams
  margin-bottom 1.5rem
  &:last-child
    margin-bottom 0

.section-home__header
  text-align center
  margin-bottom 1.5rem
  display flex
  align-items center
  flex-flow column

.section-home__title
.section-home__subtitle
  max-width 40rem

.section-home__title
  font-size h1
  color bright
  font-weight 500
  line-height 1.25
  margin-bottom 1rem

.section-home__subtitle
  color dim

.section-home__text
  max-width 32rem
  margin-left auto
  margin-right auto

.section-home__p
  margin-bottom 1.5rem
  &:last-child
    margin-bottom 0

.section-home__diagrams
  background app-bg

.cosmos-diagram
  display flex
  flex-flow row nowrap

.cosmos-diagram__image
  flex 1
  padding 1rem

  i.material-icons
    background link
    color bright
    font-size 4rem
    display flex
    align-items center
    justify-content center
    padding 1rem 0
    width 100%
    width 8rem
    height 8rem
    border-radius 4rem

.cosmos-diagram__img
  max-width 8rem

.cosmos-diagram__label
  flex 2
  padding 1rem 1rem 1rem 0
  display flex
  align-items center
  font-size sm

@media screen and (min-width: 375px)
  .cosmos-diagram__label
    padding 1rem

@media screen and (min-width: 768px)
  .section-home__container
    padding 3rem 1rem

  .section-home__header
  .section-home__text
  .section-home__diagrams
    margin-bottom 3rem

  .section-home__subtitle
    font-size lg

  .section-home__diagrams
    display flex
    flex-flow row nowrap
    padding 2rem

  .cosmos-diagram
    flex 1
    flex-flow column nowrap

  .cosmos-diagram__image
    display flex
    align-items center
    justify-content center
    margin-bottom 1rem

  .cosmos-diagram__label
    flex 1
    text-align center
    align-items flex-start
    padding-bottom 0

@media screen and (min-width: 1024px)
  .section-home__diagrams
    margin-left 1rem
    margin-right 1rem
</style>
