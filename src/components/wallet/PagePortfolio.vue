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
      <h3 class="tab-header transactions">
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
      <h3 class="tab-header transactions">
        Delegations
      </h3>
      <DelegationsOverview />
      <template v-if="unbondingTransactions.length">
        <h3 class="tab-header transactions">
          Pending Undelegations
        </h3>
        <div class="unbonding-transactions">
          <LiAnyTransaction
            v-for="tx in unbondingTransactions"
            :key="tx.txhash"
            :validators="yourValidators"
            :validators-url="`/staking/validators`"
            :proposals-url="`/governance`"
            :transaction="tx"
            :address="session.address"
            :bonding-denom="bondDenom"
            :unbonding-time="
              time.getUnbondingTime(tx, delegation.unbondingDelegations)
            "
          />
        </div>
      </template>
    </template>
    <SendModal ref="sendModal" />
  </TmPage>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import orderBy from "lodash.orderby"
import LiCoin from "./LiCoin"
import SendModal from "src/ActionModal/components/SendModal"
import Bech32 from "common/Bech32"
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"
import DelegationsOverview from "staking/DelegationsOverview"
import LiAnyTransaction from "../transactions/LiAnyTransaction"
import time from "scripts/time"

export default {
  name: `page-portfolio`,
  components: {
    TmDataMsg,
    LiCoin,
    TmPage,
    SendModal,
    Bech32,
    LiAnyTransaction,
    DelegationsOverview
  },
  data: () => ({ num, showSendModal: false }),
  computed: {
    ...mapGetters([
      `wallet`,
      `connected`,
      `session`,
      `delegation`,
      `transactions`
    ]),
    dataEmpty() {
      return this.wallet.balances.length === 0
    },
    filteredBalances() {
      return orderBy(
        this.wallet.balances,
        [`amount`, balance => num.viewDenom(balance.denom).toLowerCase()],
        [`desc`, `asc`]
      )
    },
    unbondingTransactions: ({ transactions, delegation } = this) =>
      transactions.staking &&
      transactions.staking
        .filter(transaction => {
          // Checking the type of transaction
          if (transaction.tx.value.msg[0].type !== `cosmos-sdk/MsgUndelegate`)
            return false

          // getting the unbonding time and checking if it has passed already
          const unbondingEndTime = time.getUnbondingTime(
            transaction,
            delegation.unbondingDelegations
          )

          if (unbondingEndTime && unbondingEndTime >= Date.now()) return true
        })
        .map(transaction => ({
          ...transaction,
          unbondingDelegation:
            delegation.unbondingDelegations[
              transaction.tx.value.msg[0].value.validator_address
            ]
        }))
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
