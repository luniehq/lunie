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
      <div v-infinite-scroll="loadMore" infinite-scroll-distance="10">
        <LiAnyTransaction
          v-for="tx in showingTransactions"
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
      </div>
      <br />
    </template>
  </TmPage>
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import orderBy from "lodash.orderby"
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
      return orderBy(
        this.allTransactions.map(t => {
          t.height = parseInt(t.height)
          return t // TODO what happens if block height is bigger then int?
        }),
        [this.sort.property],
        [this.sort.order]
      )
    },
    showingTransactions() {
      return this.orderedTransactions.slice(0, this.showing)
    },
    dataEmpty() {
      return this.orderedTransactions.length === 0
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
    },
    loadMore() {
      this.showing += 10
    }
  }
}
</script>
