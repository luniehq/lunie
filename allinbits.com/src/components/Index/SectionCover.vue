<template lang='pug'>
section.section-home-cover
  .logos
    a.logo(href='https://cosmos.network/',target='_blank')
      img(src="../../assets/images/logo-cosmos.png")
    a.logo(href='https://tendermint.com/',target='_blank')
      img(src="../../assets/images/logo-tendermint.png")
</template>

<script>
export default {
  name: 'SectionCover'
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.section-home-cover
  background #000
  min-height 85vh

  display flex
  .logos
    flex 1

    padding 2vw

    display flex
    flex-flow column nowrap
    align-items center
    justify-content center

    max-width 1024px
    margin 0 auto

  a.logo
    flex 1
    margin 2vw
    text-align center
    img
      margin 0 auto

      display block
      width 65vw
      border 1px solid transparent

    &:hover img
      border 1px solid hsl(0,0,50)
      box-shadow hsl(0,0,25) 0.5rem 0.5rem 0 0

@media screen and (min-width: 768px)
  .section-home-cover
    a.logo img
        width 50vw

@media screen and (min-width: 1024px)
  .section-home-cover
    .logos
      flex-flow row nowrap
      padding 2vw 0
    a.logo
      margin 2vw 0
      img
        width 30vw
</style>
