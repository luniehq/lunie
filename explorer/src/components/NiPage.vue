<template lang="pug">
.ni-page
  page-header
    div(slot='title') {{ title }}
  main.ni-page-main: slot
  page-footer
</template>

<script>
import PageHeader from './NiPageHeader'
import PageFooter from './NiPageFooter'
export default {
  name: 'page-search',
  props: ['title'],
  components: {
    PageHeader,
    PageFooter
  }
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'
</style>

