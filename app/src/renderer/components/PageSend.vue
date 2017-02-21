<template>
  <div class="page-send">
    <page-header title="Send"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Send To Address</label>
        <field v-model.trim="address" placeholder="Send Address"></field>
      </div>
      <div class="form-group">
        <label>Send Amount</label>
        <field v-model.number="amount" placeholder="Send Amount"></field>
      </div>
      <div class="form-footer">
        <btn @click.native="send({ address, amount })" value="Send Now"></btn>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
export default {
  components: {
    PageHeader,
    Field,
    Btn
  },
  methods: {
    ...mapActions(['send'])
  },
  data: () => ({
    address: '',
    amount: null
  })
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
</style>
