<template lang="pug">
page-split.page-careers-index
  page-header(
    title='Careers'
    subtitle="Join us at All In Bits to build and improve <a href='https://cosmos.network'>Cosmos</a> and Tendermint.<br><br>Jobs here are constantly updated. If your specialty is unlisted, we encourage you to still apply."
    type='split'
    slot='header')

  ni-section(v-if='technical.length > 0')
    div(slot='title') Technical Positions
    card-career(v-for='c in technical', :key='c.id', :career='c')

  ni-section(v-if='design.length > 0')
    div(slot='title') Design Positions
    card-career(v-for='c in design', :key='c.id', :career='c')

  ni-section(v-if='community.length > 0')
    div(slot='title') Community Positions
    card-career(v-for='c in community', :key='c.id', :career='c')
</template>

<script>
import {mapGetters} from 'vuex'
import {orderBy} from 'lodash'
import CardCareer from './CardCareer'
import NiSection from '../NiSection'
import PageHeader from '@nylira/vue-page-header'
import PageSplit from '@nylira/vue-page-split'
export default {
  name: 'page-careers-index',
  components: {
    CardCareer,
    NiSection,
    PageHeader,
    PageSplit
  },
  computed: {
    technical () {
      return this.careers.filter(c => c.area === 'technical')
    },
    design () {
      return this.careers.filter(c => c.area === 'design')
    },
    operations () {
      return this.careers.filter(c => c.area === 'operations')
    },
    community () {
      return this.careers.filter(c => c.area === 'community')
    },
    careers () {
      let orderedCareers = orderBy(this.allCareers, ['title'], ['asc'])
      return orderedCareers
    },
    ...mapGetters(['allCareers'])
  },
  mounted () {
    document.title = 'Careers - All In Bits'
  }
}
</script>


<style lang="stylus">
@require '~variables'

.page-careers-index
  .tags
    margin-top 1rem
    text-align center
    max-width 40*x
    display flex
    flex-flow row wrap

  .tag
    font-size 0.75*x
    background lighten(bc, 50%)
    color dim
    margin-right 0.25*x
    margin-bottom 0.25*x
    padding 0.25*x 0.5*x

    cursor pointer

    background hsla(0,0,0,25%)
    color #fff
    &.active
      background darken(acolor,25%)

@media screen and (min-width: 768px)
  .page-careers-index
    .tag
      font-size x

@media screen and (min-width: 1024px)
  .page-careers-index
    .tags
      justify-content flex-start
</style>
