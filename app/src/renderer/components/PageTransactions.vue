<template>
  <div class="page-transactions">
    <page-header title="Transactions"></page-header>
    <div class="transactions">
      <card-transaction
        v-for="transaction in transactions"
        :transaction-value="transaction">
      </card-transaction>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from './PageHeader'
import CardTransaction from './CardTransaction'
export default {
  components: {
    PageHeader,
    CardTransaction
  },
  computed: {
    transactions () {
      return this.allTransactions
    },
    ...mapGetters(['allTransactions'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.transactions
  padding 0.5rem
</style>
