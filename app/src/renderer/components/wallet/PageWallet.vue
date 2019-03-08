<template>
  <tm-page
    :loading="wallet.loading"
    :loaded="wallet.loaded"
    :error="wallet.error"
    :dataset="allBalances"
    :refresh="queryWalletBalances"
    data-title="Wallet"
    :sign-in-required="true"
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
    <tm-btn
      v-if="enableFaucet"
      slot="header-buttons"
      value="Get Tokens"
      color="green"
      @click.native="faucet"
    />
    <send-modal ref="sendModal" />
  </tm-page>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { orderBy } from "lodash"
import LiCoin from "./LiCoin"
import SendModal from "wallet/SendModal"
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"
import TmBtn from "../common/TmBtn"

export default {
  name: `page-wallet`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage,
    SendModal,
    TmBtn
  },
  data: () => ({ num, showSendModal: false }),
  computed: {
    ...mapGetters([`wallet`, `connected`, `session`]),
    enableFaucet() {
      return !!this.wallet.externals.config.faucet && this.session.signedIn
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
      return orderBy(
        this.allDenomBalances,
        [`amount`, balance => balance.denom.toLowerCase()],
        [`desc`, `asc`]
      )
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler() {
        if (this.session.signedIn) {
          this.queryWalletBalances()
        }
      }
    }
  },
  async mounted() {
    this.updateDelegates()
    await this.queryWalletBalances()
  },
  methods: {
    ...mapActions([`updateDelegates`, `queryWalletBalances`]),
    showModal(denomination) {
      this.$refs.sendModal.open(denomination)
    },
    async faucet() {
      if (this.session.signedIn) {
        await this.$store.dispatch(`getMoney`, this.session.address)
      }
    }
  }
}
</script>
