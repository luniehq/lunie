<template>
  <tm-page
    :loading="transactions.loading"
    :loaded="transactions.loaded"
    :error="transactions.error"
    :dataset="orderedTransactions"
    :refresh="refreshTransactions"
    data-title="Transactions"
  >
    <data-empty-tx slot="no-data" />
    <template slot="managed-body">
      <li-any-transaction
        v-for="tx in orderedTransactions"
        :key="tx.txhash"
        :validators="delegates.delegates"
        :validators-url="validatorURL"
        :proposals-url="governanceURL"
        :transaction="tx"
        :address="session.address"
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
import { orderBy } from "lodash"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmPage from "common/TmPage"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import time from "scripts/time"

export default {
  name: `page-transactions`,
  components: {
    LiAnyTransaction,
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
      `allTransactions`,
      `session`,
      `bondDenom`,
      `delegation`,
      `delegates`
    ]),
    orderedTransactions() {
      console.log(this.transactions.goverance)
      return orderBy(
        this.allTransactions.map(t => {
          t.height = parseInt(t.height)
          return t // TODO what happens if block height is bigger then int?
        }),
        [this.sort.property],
        [this.sort.order]
      )
    }
  },
  mounted() {
    this.refreshTransactions()
  },
  methods: {
    async refreshTransactions() {
      await this.$store.dispatch(`getAllTxs`)
    }
  }
}
</script>
