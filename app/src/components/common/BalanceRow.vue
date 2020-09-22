<template>
  <div class="balance-row">
    <div :key="balance.denom" class="table-cell big">
      <img
        class="currency-flag"
        :src="
          currentNetwork.coinLookup.find(
            ({ viewDenom }) => viewDenom === balance.denom
          )
            ? currentNetwork.coinLookup.find(
                ({ viewDenom }) => viewDenom === balance.denom
              ).icon
            : '/img/icons/currencies/' + balance.denom.toLowerCase() + '.png'
        "
        :alt="`${balance.denom}` + ' currency'"
      />
      <div class="total-and-fiat">
        <span class="total">
          {{ balance.total | bigFigureOrShortDecimals }}
          {{ balance.denom }}
        </span>
        <span
          v-if="balance.fiatValue && !isTestnet && balance.fiatValue.amount > 0"
          class="fiat"
        >
          {{ bigFigureOrShortDecimals(balance.fiatValue.amount) }}
          {{ balance.fiatValue.denom }}</span
        >
      </div>
    </div>

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_rewards'"
      class="table-cell rewards"
    >
      <h2
        v-if="
          totalRewardsPerDenom && totalRewardsPerDenom[balance.denom] > 0.001
        "
      >
        +{{ totalRewardsPerDenom[balance.denom] | bigFigureOrShortDecimals }}
        {{ balance.denom }}
      </h2>
      <h2 v-else-if="!unstake">0</h2>
    </div>

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_available'"
      class="table-cell available"
    >
      <span v-if="balance.type === 'STAKE'" class="available-amount">
        {{ balance.available | bigFigureOrShortDecimals }}
      </span>
    </div>

    <div
      v-if="!unstakingBalance"
      :key="balance.denom + '_actions'"
      class="table-cell actions"
    >
      <div v-if="send" class="icon-button-container">
        <button class="icon-button" @click="onSend(balance.denom)">
          <i class="material-icons">send</i></button
        ><span>Send</span>
      </div>
      <div v-if="stake" class="icon-button-container">
        <button class="icon-button" @click="onStake(balance.denom)">
          <i class="material-icons">arrow_upward</i></button
        ><span>Stake</span>
      </div>
      <div v-if="unstake" class="icon-button-container">
        <button class="icon-button" @click="onUnstake(balance.denom)">
          <i class="material-icons">arrow_downward</i></button
        ><span>Unstake</span>
      </div>
    </div>

    <SendModal ref="SendModal" :denoms="[balance.denom]" />
    <DelegationModal ref="StakeModal" />
    <UndelegationModal ref="UnstakeModal" />

    <!-- endTime span for Polkadot undelegations -->
    <div
      v-if="unstakingBalance"
      :key="balance.denom + '_endtime'"
      class="table-cell endtime"
    >
      <span v-if="unstakeClaimable">Claimable</span>
      <span v-else>
        {{ balance.endTime | fromNow }}
      </span>
    </div>
  </div>
</template>
<script>
import { bigFigureOrShortDecimals } from "scripts/num"
import { fromNow } from "src/filters"
import SendModal from "src/ActionModal/components/SendModal"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import { mapGetters, mapState } from "vuex"
export default {
  name: `balance-row`,
  components: {
    SendModal,
    DelegationModal,
    UndelegationModal,
  },
  filters: {
    bigFigureOrShortDecimals,
    fromNow,
  },
  props: {
    balance: {
      type: Object,
      required: true,
    },
    totalRewardsPerDenom: {
      type: Object,
      default: () => {},
    },
    stake: {
      type: Boolean,
      default: false,
    },
    unstake: {
      type: Boolean,
      default: false,
    },
    send: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([`networks`, `currentNetwork`, `stakingDenom`]),
    isTestnet() {
      return this.networks.find(
        (network) => network.id === this.currentNetwork.id
      ).testnet
    },
    unstakingBalance() {
      return this.balance.endTime ? true : false
    },
    unstakeClaimable() {
      return new Date(this.balance.endTime) <= new Date()
    },
  },
  methods: {
    bigFigureOrShortDecimals,
    onSend(denom = undefined) {
      this.$refs.SendModal.open(denom)
    },
    onStake(amount) {
      this.$refs.StakeModal.open()
    },
    onUnstake() {
      this.$refs.UnstakeModal.open()
    },
  },
}
</script>
<style scoped>
.balance-row {
  display: flex;
  border: 1px solid var(--bc);
  border-radius: 0.25rem;
  background: var(--app-bg);
  margin-top: -1px;
}

.table-cell {
  flex-grow: 1;
  padding: 0.5rem 0.5rem 0.5rem 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  width: 20%;
  font-family: "SF Pro Text", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  position: relative;
  white-space: nowrap;
}

.rewards {
  color: var(--success);
}

.fiat {
  color: var(--dim);
  padding-left: 1rem;
}

.total {
  color: var(--bright);
}

.total-and-fiat {
  display: flex;
  flex-direction: row;
}

.currency-flag {
  width: 2.5rem;
  height: 2.5rem;
  max-width: 100%;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 50%;
}

.table-cell.big {
  width: 40%;
  padding-left: 1rem;
}

.table-cell.big.title {
  padding-left: 0;
}

.icon-button-container {
  margin-right: 1rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-width: 3rem;
}

.icon-button-container span {
  display: block;
  font-size: 12px;
  text-align: center;
  color: var(--dim);
  padding-top: 2px;
}

.icon-button {
  border-radius: 50%;
  background: var(--link);
  border: none;
  outline: none;
  height: 2rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s ease;
}

.icon-button:hover {
  background: var(--link-hover);
  cursor: pointer;
}

.icon-button i {
  font-size: 14px;
  color: var(--menu-bright);
  font-weight: 900;
}

@media screen and (max-width: 667px) {
  .available {
    display: none;
  }

  .table {
    padding: 1rem;
  }

  .table-cell {
    width: 40%;
  }

  .table-cell.big {
    width: 60%;
  }

  .rewards {
    font-size: 12px;
  }

  .endtime {
    font-size: 12px;
  }
}

@media screen and (min-width: 1254px) {
  .send-button {
    display: none;
  }
}

@media screen and (max-width: 1254px) {
  .actions {
    display: none;
  }

  .total-and-fiat {
    display: flex;
    flex-direction: column;
  }

  .fiat {
    padding: 0;
    font-size: 12px;
  }
}
</style>
