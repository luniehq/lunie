<template>
  <div class="balance-header">
    <div class="values-container">
      <div class="total-atoms">
        <h3>Total {{ num.viewDenom(bondDenom) }}</h3>
        <h2 class="total-atoms__value">{{ totalAtomsDisplay }}</h2>
      </div>

      <div class="row small-container">
        <div class="available-atoms">
          <h3>Available {{ num.viewDenom(bondDenom) }}</h3>
          <h2>{{ unbondedAtoms }}</h2>
        </div>

        <div v-if="rewards" class="rewards">
          <h3>Total Rewards</h3>
          <h2>+{{ rewards }}</h2>
        </div>

        <!-- <div class="user-address">
          <h3>Your Address</h3>
          <Bech32 :address="session.address || ''" />
        </div> -->
      </div>
    </div>
    <div class="button-container">
      <TmBtn
        class="send-button"
        value="Send"
        type="secondary"
        @click.native="onSend()"
      />
      <TmBtn
        id="withdraw-btn"
        :disabled="!readyToWithdraw"
        class="withdraw-rewards"
        value="Claim Rewards"
        @click.native="readyToWithdraw && onWithdrawal()"
      />
    </div>

    <SendModal ref="SendModal" />
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
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  components: {
    Bech32,
    TmBtn,
    SendModal,
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
    },
    onSend() {
      this.$refs.SendModal.open(this.bondDenom)
    }
  }
}
</script>
<style scoped>
.balance-header {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.values-container {
  display: flex;
  position: relative;
  width: 100%;
  padding: 1rem 2rem;
  flex-direction: column;
}

.values-container h2 {
  font-size: 24px;
  font-weight: 500;
  line-height: 24px;
  color: var(--bright);
}

.values-container h3 {
  font-size: var(--sm);
  font-weight: 400;
  white-space: nowrap;
}

.total-atoms,
.available-atoms,
.rewards {
  padding-right: 2.5rem;
}

.rewards h2 {
  color: var(--success);
  font-size: var(--m);
}

.available-atoms h2 {
  font-size: var(--m);
  line-height: 20px;
}

.button-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 2rem;
  width: 100%;
  border-bottom: 1px solid var(--bc-dim);
  border-top: 1px solid var(--bc-dim);
  margin-bottom: 2rem;
}

.button-container button:first-child {
  margin-right: 0.5rem;
}

.row {
  display: flex;
  flex-direction: row;
}

.small-container {
  padding-top: 1rem;
}

@media screen and (max-width: 667px) {
  .balance-header {
    display: flex;
    flex-direction: column;
  }

  .values-container {
    flex-direction: column;
    width: 100%;
  }

  .values-container .total-atoms__value {
    font-size: 28px;
    font-weight: 500;
    line-height: 32px;
  }

  .available-atoms,
  .rewards {
    padding: 0;
  }

  .total-atoms {
    padding: 1rem 0;
    text-align: center;
  }

  .button-container {
    width: 100%;
    padding: 1rem;
    border-top: 1px solid var(--bc);
  }

  .button-container button {
    width: 50%;
  }

  .small-container {
    display: flex;
    justify-content: space-evenly;
    padding: 1rem 0;
    text-align: center;
  }
}
</style>
