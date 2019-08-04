<template>
  <TmPage
    :managed="true"
    :loading="wallet.loading && delegation.loading"
    :loaded="wallet.loaded && delegation.loaded"
    :error="wallet.error || delegation.error"
    :sign-in-required="true"
    :hide-header="true"
  >
    <template slot="managed-body">
      <div class="card">
        <h3>Your Public Cosmos Address</h3>
        <Bech32 :address="session.address || ''" long-form />
      </div>
      <h3 class="tab-header">
        Balances
      </h3>
      <TmDataMsg
        v-if="wallet.balances.length === 0"
        id="account_empty_msg"
        slot="no-data"
        icon="account_balance_wallet"
      >
        <div slot="title">
          Account empty
        </div>
        <div slot="subtitle">
          This account doesn't have anything in it&nbsp;yet.
        </div>
      </TmDataMsg>
      <LiCoin
        v-for="coin in filteredBalances"
        v-else
        :key="coin.denom"
        :coin="coin"
        class="tm-li-balance"
        @show-modal="showModal"
      />
      <h3 class="tab-header">
        Delegations
      </h3>
      <DelegationsOverview />
      <template v-if="Object.keys(delegation.unbondingDelegations).length">
        <h3 class="tab-header">
          Pending Undelegations
        </h3>
        <Undelegations />
      </template>
    </template>
    <SendModal ref="sendModal" />
  </TmPage>
</template>

<script>
import num from "scripts/num"
import { mapGetters } from "vuex"
import orderBy from "lodash.orderby"
import LiCoin from "./LiCoin"
import SendModal from "src/ActionModal/components/SendModal"
import Bech32 from "common/Bech32"
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"

export default {
  name: `page-portfolio`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage,
    SendModal,
    Bech32,
    Undelegations,
    DelegationsOverview
  },
  computed: {
    ...mapGetters([`wallet`, `connected`, `session`, `delegation`]),
    filteredBalances() {
      return orderBy(
        this.wallet.balances,
        [`amount`, balance => num.viewDenom(balance.denom).toLowerCase()],
        [`desc`, `asc`]
      )
    }
  },
  methods: {
    showModal(denomination) {
      this.$refs.sendModal.open(denomination)
    }
  }
}
</script>

<style scoped>
.card {
  background: var(--app-fg);
  border-radius: 2px;
  padding: 1rem;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
}

.card h3 {
  font-size: 14px;
  font-weight: 400;
}
</style>
