<template lang="pug">
.ni-page
  page-header(:icon='icon')
    div(slot="menu"): slot(name="menu")
  main.ni-page-main
    h2.ni-page-title {{ title }}
    h3.ni-page-subtitle {{ subtitle }}
    .ni-page-content: slot
  page-footer
</template>

<script>
import PageHeader from 'common/NiPageHeader'
import PageFooter from 'common/NiPageFooter'
export default {
  name: 'ni-page',
  props: ['title', 'subtitle', 'icon'],
  components: {
    PageHeader,
    PageFooter
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page
  max-width aw
  margin 0 auto

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
