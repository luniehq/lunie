<template lang="pug">
.ni-page
  page-header(:icon='icon')
    div(slot='title') {{ title }}
    div(slot='subtitle') {{ subtitle }}
    div(slot="menu"): slot(name="menu")
  main.ni-page-main: slot
  app-footer
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar'
import PageHeader from 'common/NiPageHeader'
import AppFooter from 'common/AppFooter'
export default {
  name: 'ni-page',
  props: ['title', 'subtitle', 'icon'],
  components: {
    PageHeader,
    AppFooter
  },
  mounted () {
    const ps = new PerfectScrollbar('.ni-page-main')
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page
  flex 1
  display flex
  flex-flow column nowrap

.ni-page-main
  flex 1
  overflow-y scroll

.ni-page-title
  color bright
  font-size h2
  padding 0.5rem 1rem 1rem

.ni-page-subtitle
  > div
    color dim
    font-size sm

@media screen and (min-width: 768px)
  .ni-page-main
    padding 1rem
</style>
