<template>
  <tm-page
    :loading="transactions.loading"
    :loaded="transactions.loaded"
    :error="transactions.error"
    :dataset="orderedTransactions"
    :refresh="refreshTransactions"
    :has-filtered-data="hasFilteredData"
    data-title="Transactions"
  >
    <data-empty-tx slot="no-data" />
    <template slot="managed-body">
      <tm-li-any-transaction
        v-for="tx in filteredTransactions"
        :key="tx.txhash"
        :validators="delegates.delegates"
        :validators-url="validatorURL"
        :proposals-url="governanceURL"
        :transaction="tx"
        :address="wallet.address"
        :bonding-denom="bondDenom"
        :unbonding-time="
          time.getUnbondingTime(tx, delegation.unbondingDelegations)
        "
      />
      <br>
    </template>
  </tm-page>
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import { includes, orderBy } from "lodash"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmPage from "common/TmPage"
import TmLiAnyTransaction from "transactions/TmLiAnyTransaction"
import time from "scripts/time"

export default {
  name: `page-transactions`,
  components: {
    TmLiAnyTransaction,
    DataEmptyTx,
    TmPage
  },
  data: () => ({
    shortid: shortid,
    sort: {
      property: `height`,
      order: `desc`
    },
    validatorURL: `/staking/validators`,
    governanceURL: `/governance`,
    time
  }),
  computed: {
    ...mapGetters([
      `transactions`,
      `filters`,
      `allTransactions`,
      `wallet`,
      `bondDenom`,
      `delegation`,
      `delegates`
    ]),
    orderedTransactions() {
      return orderBy(
        this.allTransactions.map(t => {
          t.height = parseInt(t.height)
          return t // TODO what happens if block height is bigger then int?
        }),
        [this.sort.property],
        [this.sort.order]
      )
    },
    filteredTransactions({ orderedTransactions, filters } = this) {
      const query = filters.transactions.search.query
      if (filters.transactions.search.visible) {
        // doing a full text comparison on the transaction data
        return orderedTransactions.filter(t =>
          includes(JSON.stringify(t).toLowerCase(), query)
        )
      } else {
        return orderedTransactions
      }
    },
    hasFilteredData({ filteredTransactions } = this) {
      return filteredTransactions.length > 0
    }
  },
  mounted() {
    this.refreshTransactions()
  },
  methods: {
    async refreshTransactions({ $store } = this) {
      await $store.dispatch(`getAllTxs`)
    }
  }
}
</script>
