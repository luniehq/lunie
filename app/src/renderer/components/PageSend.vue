<template>
  <div class="page-send">
    <page-header title="Send"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Send To Address</label>
        <field placeholder="Send Address"></field>
      </div>
      <div class="form-group">
        <label>Send Amount</label>
        <field placeholder="Send Amount"></field>
      </div>
      <div class="form-footer">
        <btn type="submit" value="Send Now"></btn>
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
