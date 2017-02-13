<template>
  <div class="page-receive">
    <page-header title="Receive"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Generate Receive Address</label>
        <btn icon="refresh" value="Generate Address"></btn>
      </div>
    </form>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
export default {
  components: {
    PageHeader,
    Field,
    Btn
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
</style>
