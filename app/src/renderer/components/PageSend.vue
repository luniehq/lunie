<template>
  <div class="page-send">
    <page-header title="Send"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Send To Address</label>
        <vue-input placeholder="Send Address"></vue-input>
      </div>
      <div class="form-group">
        <label>Send Amount</label>
        <vue-input placeholder="Send Amount"></vue-input>
      </div>
      <div class="form-footer">
        <vue-button btn-type="submit" btn-value="Send Now"></vue-button>
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
