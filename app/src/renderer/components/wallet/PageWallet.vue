<template>
  <tm-page
    :loading="wallet.loading"
    :loaded="wallet.loaded"
    :error="wallet.error"
    :dataset="wallet.balances"
    :refresh="queryWalletBalances"
    :filtered-data="filteredBalances"
    search="balances"
    title="Wallet"
  >
    <tm-data-msg id="account_empty_msg" slot="no-data" icon="help_outline">
      <div slot="title">Account empty</div>
      <div slot="subtitle">
        This account doesn't hold any coins yet. Go to the&nbsp;
        <a href="https://gaia.faucetcosmos.network/">token faucet</a> &nbsp;to
        aquire tokens to play with.
      </div>
    </tm-data-msg>
    <li-coin
      v-for="coin in filteredBalances"
      slot="managed-body"
      :key="coin.denom"
      :coin="coin"
      class="tm-li-balance"
    />
  </tm-page>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { includes, orderBy } from "lodash"
import LiCoin from "./LiCoin"
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"

export default {
  name: `page-wallet`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage
  },
  data: () => ({ num }),
  computed: {
    ...mapGetters([
      `filters`,
      `wallet`,
      `committedDelegations`,
      `oldBondedAtoms`,
      `config`,
      `connected`
    ]),
    allDenomBalances() {
      // for denoms not in balances, add empty balance
      let balances = this.wallet.balances.slice(0)
      let hasDenom = denom => {
        return !!balances.filter(balance => balance.denom === denom)[0]
      }
      for (let denom of this.wallet.denoms) {
        if (hasDenom(denom)) continue
        balances.push({ denom, amount: 0 })
      }
      return balances
    },
    filteredBalances() {
      let query = this.filters.balances.search.query
      let list = orderBy(
        this.allDenomBalances,
        [`amount`, `denom`],
        [`desc`, `asc`]
      )
      if (this.filters.balances.search.visible) {
        return list.filter(coin =>
          includes(JSON.stringify(coin).toLowerCase(), query.toLowerCase())
        )
      } else {
        return list
      }
    }
  },
  mounted() {
    this.updateDelegates()
    this.queryWalletBalances()
  },
  methods: {
    ...mapActions([`updateDelegates`, `queryWalletBalances`])
  }
}
</script>
