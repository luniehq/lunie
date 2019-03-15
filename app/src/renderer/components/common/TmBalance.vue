<template>
  <div class="header-balance">
    <div class="top">
      <div class="icon-container">
        <img class="icon" src="~assets/images/cosmos-logo.png">
      </div>
      <div class="total-atoms top-section">
        <h3>Total {{ bondDenom }}</h3>
        <h2 class="total-atoms__value">
          {{ num.shortNumber(num.atoms(totalAtoms)) }}
        </h2>
        <short-bech32 :address="session.address || ''" />
      </div>
      <div v-if="unbondedAtoms" class="unbonded-atoms top-section">
        <h3>Available {{ bondDenom }}</h3>
        <h2>{{ unbondedAtoms }}</h2>
      </div>
      <div v-if="rewards" class="top-section">
        <h3>Total Rewards</h3>
        <h2>{{ rewards }}</h2>
        <tm-btn
          id="withdraw-btn"
          class="withdraw-rewards"
          :value="connected ? 'Withdraw' : 'Connecting...'"
          :to="''"
          type="link"
          size="sm"
          @click.native="onWithdrawal"
        />
      </div>
    </div>
    <slot />
    <modal-withdraw-all-rewards ref="modalWithdrawAllRewards" />
  </div>
</template>
<script>
import num from "scripts/num"
import ShortBech32 from "common/ShortBech32"
import TmBtn from "common/TmBtn"
import ModalWithdrawAllRewards from "staking/ModalWithdrawAllRewards"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  components: {
    ShortBech32,
    TmBtn,
    ModalWithdrawAllRewards
  },
  data() {
    return {
      num
    }
  },
  computed: {
    ...mapGetters([
      `connected`,
      `session`,
      `liquidAtoms`,
      `lastHeader`,
      `totalAtoms`,
      `bondDenom`,
      `distribution`
    ]),
    unbondedAtoms() {
      return this.num.shortNumber(this.num.atoms(this.liquidAtoms))
    },
    rewards() {
      const rewards = this.distribution.totalRewards[this.bondDenom]
      return this.num.shortNumber(
        this.num.atoms(rewards && rewards > 10 ? rewards : 0)
      )
    }
  },
  watch: {
    lastHeader: {
      immediate: true,
      handler(newHeader) {
        const waitTenBlocks = Number(newHeader.height) % 10 === 0
        if (this.session.signedIn && waitTenBlocks) {
          this.$store.dispatch(`getTotalRewards`)
          this.$store.dispatch(`queryWalletBalances`)
        }
      }
    }
  },
  methods: {
    onWithdrawal() {
      this.$refs.modalWithdrawAllRewards.open()
    }
  }
}
</script>
<style scoped>
.header-balance {
  align-items: baseline;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem 0 2rem 2rem;
}

.header-balance .top {
  display: flex;
  flex-direction: row;
}

.top-section {
  padding: 0 2rem;
}

.header-balance .top > .top-section {
  border-right: var(--bc-dim) 1px solid;
  position: relative;
}

.header-balance .top > div:last-of-type {
  border-right: none;
}

.header-balance .top h3 {
  color: var(--dim);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.header-balance .top h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 40px;
}

.header-balance .top .icon-container {
  display: block;
  height: 100%;
}

.header-balance .top .icon {
  border-right: none;
  height: 60px;
  margin: 0 1rem 0 0;
  padding: 0;
  width: 60px;
}

.header-balance .top .total-rewards .group {
  align-items: baseline;
  display: flex;
  flex-direction: row;
}

.header-balance .top .total-rewards .group a {
  padding-left: 10px;
}

.withdraw-rewards {
  font-size: var(--sm);
  position: absolute;
  font-weight: 300;
}
</style>
