<template>
  <div class="header-balance">
    <div class="top">
      <div class="total-atoms top-section">
        <h3>Total {{ num.viewDenom(bondDenom) }}</h3>
        <h2 class="total-atoms__value">
          {{ totalAtomsDisplay }}
        </h2>
        <Bech32 :address="session.address || ''" />
      </div>
      <div class="unbonded-atoms top-section">
        <h3>Available {{ num.viewDenom(bondDenom) }}</h3>
        <h2>{{ unbondedAtoms }}</h2>
      </div>
      <div
        v-if="rewards"
        class="top-section"
      >
        <h3>Rewards</h3>
        <h2>{{ rewards }}</h2>
        <TmBtn
          :disabled="!ready"
          id="withdraw-btn"
          class="withdraw-rewards"
          :value="connected ? 'Withdraw' : 'Connecting...'"
          :to="''"
          type="anchor"
          size="sm"
          @click.native="ready && onWithdrawal()"
        />
      </div>
    </div>
    <slot />
    <ModalWithdrawRewards
      ref="ModalWithdrawRewards"
      :rewards="totalRewards"
      :denom="bondDenom"
    />
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
      `distribution`
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
    totalRewards() {
      return this.distribution.totalRewards[this.bondDenom]
    },
    ready() {
      return (
        Object.entries(this.distribution.rewards)
          .map(([validator, rewards]) => rewards[this.bondDenom])
          .filter(bondDenomRewards => bondDenomRewards > 0).length > 0 &&
        this.totalRewards > 0
      )
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
      this.$store.dispatch(`getTotalRewards`)
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
  padding: 1rem 0 2.5rem 1rem;
}

.bech32-address {
  position: absolute;
}

.total-atoms.top-section {
  padding-left: 0;
}

.header-balance .top {
  display: flex;
  flex-direction: row;
}

.top-section {
  border-right: var(--bc-dim) 2px solid;
  position: relative;
  padding: 0 2rem;
}

.top-section:last-of-type {
  border-right: none;
}

.header-balance .top h3 {
  font-size: 14px;
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
}

.header-balance .top h2 {
  color: var(--bright);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 40px;
}

.withdraw-rewards {
  font-size: var(--sm);
  position: absolute;
  font-weight: 500;
}

@media screen and (max-width: 767px) {
  .header-balance {
    padding: 0 0 1.5rem 0;
  }

  .top-section {
    padding: 0.5rem 0 1rem;
    border-right: none;
  }

  .top-section:not(:first-child) {
    margin-left: 2rem;
  }

  .top-section:nth-child(2) {
    display: none;
  }
}
</style>
