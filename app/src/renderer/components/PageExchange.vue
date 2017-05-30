<template>
  <div class="page-exchange">
    <page-header title="Exchange"></page-header>
    <div class="page-content">
      <card-empty
        value="Exchange is under construction">
      </card-empty>
    </div>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import CardEmpty from './CardEmpty'
export default {
  name: 'page-exchange',
  components: {
    PageHeader,
    CardEmpty
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-content
  padding 0.5rem
</style>
