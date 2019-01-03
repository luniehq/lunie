<template>
  <tm-page data-title="Transactions">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar>
        <a
          v-tooltip.bottom="'Refresh'"
          :disabled="!connected"
          class="refresh-button"
          @click="connected && refreshTransactions()"
        >
          <i class="material-icons">refresh</i>
        </a>
        <a
          v-tooltip.bottom="'Search'"
          :disabled="!somethingToSearch"
          class="search-button"
          @click="setSearch()"
        >
          <i class="material-icons">search</i>
        </a>
      </tool-bar>
    </template>

    <managed-body
      :connected="connected"
      :loading="transactions.loading"
      :loaded="transactions.loaded"
      :error="transactions.error"
      :data="allTransactions"
      :filtered-data="filteredTransactions"
      :search="{ type: `transactions` }"
    >
      <data-empty-tx slot="no-data" />
      <tm-li-any-transaction
        v-for="tx in filteredTransactions"
        slot="data-body"
        :validators="delegates.delegates"
        :validators-url="validatorURL"
        :proposals-url="proposalsURL"
        :key="tx.hash"
        :transaction="tx"
        :address="wallet.address"
        :bonding-denom="bondingDenom"
        :unbonding-time="getUnbondingTime(tx)"
      />
    </managed-body>
  </tm-page>
</template>

<script>
import shortid from "shortid"
import { mapGetters, mapState } from "vuex"
import { includes, orderBy } from "lodash"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmBalance from "common/TmBalance"
import TmPage from "common/TmPage"
import TmLiAnyTransaction from "transactions/TmLiAnyTransaction"
import ToolBar from "common/ToolBar"
import ManagedBody from "../common/ManagedBody"
export default {
  name: `page-transactions`,
  components: {
    ManagedBody,
    TmBalance,
    TmLiAnyTransaction,
    DataEmptyTx,
    TmPage,
    ToolBar
  },
  data: () => ({
    shortid: shortid,
    sort: {
      property: `height`,
      order: `desc`
    },
    validatorURL: `/staking/validators`,
    proposalsURL: `/governance/proposals`
  }),
  computed: {
    ...mapState([`transactions`]),
    ...mapGetters([
      `filters`,
      `allTransactions`,
      `wallet`,
      `bondingDenom`,
      `delegation`,
      `delegates`,
      `connected`
    ]),
    enrichedTransactions() {
      return this.allTransactions.map(this.enrichUnbondingTransactions)
    },
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
    filteredTransactions() {
      let query = this.filters.transactions.search.query
      if (this.filters.transactions.search.visible) {
        // doing a full text comparison on the transaction data
        return this.orderedTransactions.filter(t =>
          includes(JSON.stringify(t).toLowerCase(), query)
        )
      } else {
        return this.orderedTransactions
      }
    }
  },
  mounted() {
    this.refreshTransactions()
  },
  methods: {
    refreshTransactions() {
      this.$store.dispatch(`getAllTxs`)
    },
    getUnbondingTime(transaction) {
      let copiedTransaction = JSON.parse(JSON.stringify(transaction))
      let type = copiedTransaction.tx.value.msg[0].type
      if (type === `cosmos-sdk/BeginUnbonding`) {
        let tx = copiedTransaction.tx.value.msg[0].value
        let unbondingDelegation = this.delegation.unbondingDelegations[
          tx.validator_addr
        ]
        if (
          unbondingDelegation &&
          unbondingDelegation.creation_height ===
            String(copiedTransaction.height)
        )
          return new Date(unbondingDelegation.min_time).getTime()
      }
      return copiedTransaction
    }
  }
}
</script>
