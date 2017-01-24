<template>
  <div class="page-receive">
    <page-header title="Receive"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Generate Receive Address</label>
        <vue-button btn-icon="refresh" btn-value="Generate Address"></vue-input>
      </div>
    </form>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import VueInput from '@nylira/vue-input'
import VueButton from '@nylira/vue-button'
export default {
  components: {
    PageHeader,
    VueInput,
    VueButton
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
</style>
