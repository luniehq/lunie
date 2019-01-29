<template>
  <tm-page
    :loading="wallet.loading"
    :loaded="wallet.loaded"
    :error="wallet.error"
    :dataset="allBalances"
    :refresh="queryWalletBalances"
    :has-filtered-data="hasFilteredData"
    search="balances"
    data-title="Wallet"
  >
    <tm-data-msg id="account_empty_msg" slot="no-data" icon="help_outline">
      <div slot="title">
        Account empty
      </div>
      <div slot="subtitle">
        This account doesn't have anything in it yet.
      </div>
    </tm-data-msg>
    <li-coin
      v-for="coin in filteredBalances"
      slot="managed-body"
      :key="coin.denom"
      :coin="coin"
      class="tm-li-balance"
      @show-modal="showModal"
    />
    <send-modal ref="sendModal" />
  </tm-page>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { includes, orderBy } from "lodash"
import LiCoin from "./LiCoin"
import SendModal from "wallet/SendModal"
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"

/**
 * Page Wallet
 * @vue-prop {Number} num Module that implements all the numerical methods
 * @vue-computed {function} filters mapGetter
 * @vue-computed {function} wallet mapGetter
 * @vue-computed {function} connected mapGetter
 *
 * @vue-computed {function} somethingToSearch returns a boolean stating true if we have data and we are not in loading phase
 * @vue-computed {function} allDenomBalances for denoms not in balances, add empty balance
 * @vue-computed {function} filteredBalances filter the balance per coin name, returns an ordered list
 *
 * @vue-methods {function} updateDelegates mapAction
 * @vue-methods {function} setSearch launches the setSearchVisible action if somethingToSearch returns true
 * @vue-methods {function} queryWalletBalances trigger an update of the balances
 */
export default {
  name: `page-wallet`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage,
    SendModal
  },
  data: () => ({ num, showSendModal: false }),
  computed: {
    ...mapGetters([`filters`, `wallet`, `connected`]),
    somethingToSearch() {
      return !this.wallet.loading && !!this.wallet.balances.length
    },
    allDenomBalances() {
      // for denoms not in balances, add empty balance
      const balances = this.wallet.balances.slice(0)
      const hasDenom = denom => {
        return !!balances.filter(balance => balance.denom === denom)[0]
      }
      for (const denom of this.wallet.denoms) {
        if (hasDenom(denom)) continue
        balances.push({ denom, amount: 0 })
      }
      return balances
    },
    allBalances() {
      return this.wallet.balances
    },
    filteredBalances() {
      const query = this.filters.balances.search.query
      const list = orderBy(
        this.allDenomBalances,
        [`amount`, balance => balance.denom.toLowerCase()],
        [`desc`, `asc`]
      )
      if (this.filters.balances.search.visible) {
        return list.filter(coin =>
          includes(JSON.stringify(coin).toLowerCase(), query.toLowerCase())
        )
      } else {
        return list
      }
    },
    hasFilteredData({ filteredBalances } = this) {
      return filteredBalances.length > 0
    }
  },
  mounted() {
    this.updateDelegates()
    this.queryWalletBalances()
  },
  methods: {
    ...mapActions([`updateDelegates`, `queryWalletBalances`]),
    showModal(denomination) {
      this.$refs.sendModal.open(denomination)
    }
  }
}
</script>
