<template>
  <div class="page-transactions">
    <page-header title="Transactions"></page-header>
    <div class="page-content">
      <card-transaction
        v-for="transaction in transactions"
        :transaction-value="transaction">
      </card-transaction>
      <card-empty
        v-if="transactions.length < 1"
        value="No transactions yet">
      </card-empty>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'
import PageHeader from './PageHeader'
import CardTransaction from './CardTransaction'
import CardEmpty from './CardEmpty'
export default {
  components: {
    PageHeader,
    CardTransaction,
    CardEmpty
  },
  computed: {
    transactions () {
      return orderBy(this.allTransactions, ['time'], ['desc'])
    },
    ...mapGetters(['allTransactions'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-content
  padding 0.5rem
</style>
