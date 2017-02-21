<template>
  <div class="page-exchange">
    <page-header title="Exchange"></page-header>
    <div class="page-content">
      <div class="card-empty">Exchange is under construction.</div>
    </div>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
export default {
  name: 'page-exchange',
  components: {
    PageHeader
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-content
  padding 0.5rem
</style>
