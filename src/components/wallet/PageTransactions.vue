/* eslint-disable prettier/prettier */
<template>
  <TmPage
    :managed="true"
    :loading="transactions.loading"
    :loaded="transactions.loaded"
    :error="transactions.error"
    :data-empty="dataEmpty"
    data-title="Transactions"
    :sign-in-required="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <TransactionList
        validators-url="/staking/validators"
        proposals-url="/governance"
        :transactions="flatOrderedTransactionList"
        :address="session.address"
        :bonding-denom="bondDenom"
        :validators="validators"
        :unbonding-delegations="delegation.unbondingDelegations"
      />
      <br />
    </template>
  </TmPage>
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmPage from "common/TmPage"
import TransactionList from "../transactions/TransactionList"

export default {
  name: `page-transactions`,
  components: {
    TransactionList,
    DataEmptyTx,
    TmPage
  },
  data: () => ({
    shortid: shortid
  }),
  computed: {
    ...mapGetters([
      `transactions`,
      `flatOrderedTransactionList`,
      `session`,
      `bondDenom`,
      `delegation`,
      `delegates`,
      `validators`
    ]),
    dataEmpty() {
      return this.flatOrderedTransactionList.length === 0
    }
  },
  watch: {
    "session.signedIn": {
      immediate: true,
      handler() {
        this.refreshTransactions()
      }
    }
  },

  methods: {
    async refreshTransactions({ $store, session } = this) {
      if (session.signedIn) {
        await $store.dispatch(`getAllTxs`)
      }
    }
  }
}
</script>
