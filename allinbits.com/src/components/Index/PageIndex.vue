<template>
  <div class="page-index">
    <section-cover></section-cover>
  </div>
</template>

<script>
import SectionCover from './SectionCover'

export default {
  name: 'page-index',
  components: {
    SectionCover
  },
  head: {
    title () {
      return {
        inner: 'Welcome',
        separator: '-',
        complement: 'All In Bits, Inc.'
      }
    }
  }
}
</script>

<style scoped lang="stylus">
@require '../../styles/variables.styl'
</style>
