<template>
  <ni-section class="section-home-careers">
    <div slot="title">Tendermint is Hiring <router-link to="/careers">(see all)</router-link></div>
    <card-career v-for="c in careers" :key="c.id" :career="c" theme="dark"></card-career>
  </ni-section>
</template>

<script>
import NiSection from "./NiSection"
import CardCareer from "./CardCareer"
import { mapGetters } from "vuex"
export default {
  name: "section-home-careers",
  components: {
    NiSection,
    CardCareer
  },
  computed: {
    careers() {
      return this.allCareers.filter(c => c.weight === 4)
    },
    ...mapGetters(["allCareers"])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.section-home-careers
  .blocks
    padding-top x

  .block
    display flex
    margin-bottom 2*x
    padding 0 x

    i.fa
      font-size 1.5*x
      display block

      width 3*x
      height 3*x
      color lighten(mcolor,50%)

      display flex
      justify-content center
      align-items center

    .text
      flex 1
      padding 0 x
      span
        display inline-block
        &:not(:last-of-type):lafter
          display inline-block
          content '/'
          padding 0 0.5em

    .key
      margin 0 0 0.5*x
      font-weight 500
      font-size 1.125*x

@media screen and (min-width: 360px)
  .section-home-careers
    .block
      i.fa
        width 3.5*x
        height 3.5*x
        font-size 1.75*x
        
      .text
        padding 0 1.5*x

@media screen and (min-width: 414px)
  .section-home-careers
    .block
      i.fa
        width 4*x
        height 4*x
        font-size 2*x

@media screen and (min-width: 768px)
  .section-home-careers
    .blocks
      padding-top 2*x
    .block
      max-width 640px
      margin-left auto
      margin-right auto
      margin-bottom 3*x

      i.fa
        font-size 3*x
        width 5*x
        height 5*x

      .key
        font-size 1.25*x

@media screen and (min-width: 1024px)
  .section-home-careers
    .blocks
      padding-top 3*x
      display flex
      flex-flow row wrap
      max-width 900px
      margin 0 auto
    .block
      flex 0 0 50%
      margin-bottom 4.5*x
      padding 0 x
      i.fa
        font-size 3*x
        width 5*x
        height 5*x
      .key
        font-size 1.5*x
        margin-bottom x

      .value
        font-size 1.25*x

@media screen and (min-width: 1280px)
  .section-home-careers
    .blocks
      max-width 1080px
</style>
