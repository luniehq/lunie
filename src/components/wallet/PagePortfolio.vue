<template>
  <TmPage
    :managed="true"
    :loading="wallet.loading && delegation.loading"
    :loaded="wallet.loaded && delegation.loaded"
    :error="wallet.error || delegation.error"
    :sign-in-required="true"
    hide-header
  >
    <template slot="managed-body">
      <div class="card">
        <h3>Your Public Cosmos Address</h3>
        <Bech32 :address="session.address || ''" long-form />
      </div>
      <h3 class="tab-header">
        Rewards
      </h3>
      <LiCoin
        :coin="{ amount: totalRewards, denom: bondDenom }"
        class="tm-li-balance"
        :disabled="!readyToWithdraw"
        @show-modal="onWithdrawal"
      >
        <TmBtn value="Withdraw" color="primary" @click.native="onWithdrawal" />
      </LiCoin>
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
    <ModalWithdrawRewards
      ref="ModalWithdrawRewards"
      :rewards="totalRewards"
      :denom="bondDenom"
    />
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
import TmBtn from "common/TmBtn"
import DelegationsOverview from "staking/DelegationsOverview"
import Undelegations from "staking/Undelegations"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"

export default {
  name: `page-portfolio`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage,
    SendModal,
    Bech32,
    Undelegations,
    DelegationsOverview,
    ModalWithdrawRewards,
    TmBtn
  },
  data: () => ({
    lastUpdate: 0
  }),
  computed: {
    ...mapGetters([
      `wallet`,
      `connected`,
      `session`,
      `delegation`,
      `distribution`,
      `totalRewards`,
      `bondDenom`,
      `lastHeader`
    ]),
    filteredBalances() {
      return orderBy(
        this.wallet.balances,
        [`amount`, balance => num.viewDenom(balance.denom).toLowerCase()],
        [`desc`, `asc`]
      )
    },
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.totalRewards > 0
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler(newHeader) {
        const height = Number(newHeader.height)
        // run the update queries the first time and after every 10 blocks
        const waitedTenBlocks = height - this.lastUpdate >= 10
        if (
          this.session.signedIn &&
          (this.lastUpdate === 0 || waitedTenBlocks)
        ) {
          this.update(height)
        }
      }
    }
  },
  methods: {
    update(height) {
      this.lastUpdate = height
      this.$store.dispatch(`getRewardsFromMyValidators`)
    },
    showModal(denomination) {
      this.$refs.sendModal.open(denomination)
    },
    onWithdrawal() {
      if (!this.readyToWithdraw) return

      this.$refs.ModalWithdrawRewards.open()
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
