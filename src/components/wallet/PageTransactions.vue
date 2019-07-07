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
      <LiAnyTransaction
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
      <br />
    </template>
  </TmPage>
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import orderBy from "lodash.orderby"
import moment from "moment"
import sortby from "lodash.sortby"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmPage from "common/TmPage"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import time from "scripts/time"

const reduceTransactionMsgs = (acc, curTxList) => {
  const newVals = curTxList.tx.value.msg.map(x => {
    return {
      ...x,
      height: curTxList.height,
      time: new moment(curTxList.time)
    }
  })
  return acc.concat(newVals)
}

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
    time,
    allTx: []
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
  beforeUpdate: function() {
    this.allTx = this.allTransactions.reduce(reduceTransactionMsgs, [])
    sortby(this.allTx, ["height", "time"])
    this.allTx.reverse()
    console.log("allTxs", this.allTx)
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
