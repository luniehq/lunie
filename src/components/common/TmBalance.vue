<template>
  <div class="header-balance">
    <div class="total-atoms">
      <h3>Total {{ num.viewDenom(bondDenom) }}</h3>
      <h2 class="total-atoms__value">{{ totalAtomsDisplay }}</h2>
    </div>

    <div class="available-atoms">
      <h3>Available {{ num.viewDenom(bondDenom) }}</h3>
      <h2>{{ unbondedAtoms }}</h2>
    </div>

    <div v-if="rewards" class="rewards">
      <h3>Rewards</h3>
      <h2>{{ rewards }}</h2>
    </div>
    <div v-if="rewards" class="rewards-button">
      <TmBtn
        id="withdraw-btn"
        :disabled="!readyToWithdraw"
        class="withdraw-rewards"
        :value="'Withdraw'"
        size="sm"
        @click.native="readyToWithdraw && onWithdrawal()"
      />
    </div>
    <slot />
    <ModalWithdrawRewards ref="ModalWithdrawRewards" :rewards="totalRewards" :denom="bondDenom" />
  </div>
</template>
<script>
import num from "scripts/num"
import Bech32 from "common/Bech32"
import TmBtn from "common/TmBtn"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  components: {
    Bech32,
    TmBtn,
    ModalWithdrawRewards
  },
  data() {
    return {
      num,
      lastUpdate: 0
    }
  },
  computed: {
    ...mapGetters([
      `connected`,
      `session`,
      `wallet`,
      `delegation`,
      `liquidAtoms`,
      `lastHeader`,
      `totalAtoms`,
      `bondDenom`,
      `distribution`,
      `validatorsWithRewards`,
      `totalRewards`
    ]),
    loaded() {
      return this.wallet.loaded && this.delegation.loaded
    },
    totalAtomsDisplay() {
      return this.loaded
        ? this.num.shortDecimals(this.num.atoms(this.totalAtoms))
        : `--`
    },
    unbondedAtoms() {
      return this.loaded
        ? this.num.shortDecimals(this.num.atoms(this.liquidAtoms))
        : `--`
    },
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.totalRewards > 0
    },
    rewards() {
      if (!this.distribution.loaded) {
        return `--`
      }
      const rewards = this.totalRewards
      return this.num.shortDecimals(
        this.num.atoms(rewards && rewards > 10 ? rewards : 0)
      )
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
      this.$store.dispatch(`queryWalletBalances`)
    },
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    }
  }
}
</script>
<style scoped>
.header-balance {
  display: flex;
  position: relative;
  width: 100%;
  padding: 1rem;
}

.header-balance h3 {
  font-size: var(--sm);
  font-weight: 400;
  white-space: nowrap;
}

.header-balance h2 {
  font-size: 24px;
  font-weight: 500;
  line-height: 24px;
  color: var(--bright);
}

.total-atoms,
.available-atoms,
.rewards {
  padding-right: 2.5rem;
  width: 100%;
}

.rewards-button {
  display: flex;
  align-items: flex-end;
}

.withdraw-rewards {
  font-size: var(--sm);
  font-weight: 500;
  top: 1rem;
  right: 1rem;
}

@media screen and (max-width: 667px) {
  .header-balance {
    flex-direction: column;
    width: 100%;
    padding: 0;
  }

  .available-atoms {
    padding: 1rem 0;
  }

  .available-atoms h2 {
    font-size: var(--m);
    line-height: 20px;
  }

  .rewards {
    display: none;
  }

  .rewards-button {
    position: absolute;
    right: 2px;
    top: 0;
  }
}
</style>
