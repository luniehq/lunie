<template>
  <tm-page
    :managed="true"
    :loading="wallet.loading"
    :loaded="wallet.loaded"
    :error="wallet.error"
    :data-empty="dataEmpty"
    :refresh="queryWalletBalances"
    data-title="Wallet"
    :sign-in-required="true"
  >
    <tm-data-msg
      id="account_empty_msg"
      slot="no-data"
      icon="help_outline"
    >
      <div slot="title">
        Account empty
      </div>
      <div slot="subtitle">
        This account doesn't have anything in it yet.
      </div>
    </tm-data-msg>
    <template slot="managed-body">
      <li-coin
        v-for="coin in filteredBalances"
        :key="coin.denom"
        :coin="coin"
        class="tm-li-balance"
        @show-modal="showModal"
      />
    </template>
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
    ...mapGetters([`wallet`, `connected`, `session`]),
    dataEmpty() {
      return this.wallet.balances.length === 0
    },
    filteredBalances() {
      return orderBy(
        this.wallet.balances,
        [`amount`, balance => balance.denom.toLowerCase()],
        [`desc`, `asc`]
      )
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
    }
  }
}
</script>
