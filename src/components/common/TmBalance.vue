<template>
  <div class="balance-header">
    <div class="values-container">
      <div class="total-atoms">
        <h3>Total {{ metaData.stakingDenom }}</h3>
        <h2 class="total-atoms__value">
          {{ overview.totalStake | shortDecimals | noBlanks }}
        </h2>
      </div>

      <div class="row small-container">
        <div class="available-atoms">
          <h3>Available {{ metaData.stakingDenom }}</h3>
          <h2>{{ overview.liquidStake | shortDecimals | noBlanks }}</h2>
        </div>

        <div v-if="overview.totalRewards" class="rewards">
          <h3>Total Rewards</h3>
          <h2>{{ overview.totalRewards | shortDecimals | noBlanks }}</h2>
        </div>
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
      :denom="metaData.stakingDenom"
    />
  </div>
</template>
<script>
import num, { shortDecimals } from "scripts/num"
import { noBlanks } from "src/filters"
import TmBtn from "common/TmBtn"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import { mapState, mapGetters } from "vuex"
import { Overview, MetaData } from "src/gql"
export default {
  name: `tm-balance`,
  components: {
    TmBtn,
    SendModal,
    ModalWithdrawRewards
  },
  filters: {
    shortDecimals,
    noBlanks
  },
  data() {
    return {
      num,
      lastUpdate: 0,
      overview: {},
      metaData: {
        stakingDenom: "loading"
      }
    }
  },
  computed: {
    ...mapState([`delegation`, `session`]),
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`lastHeader`, `bondDenom`]),
    totalRewards() {
      return Number(this.overview.totalRewards)
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
      this.$store.dispatch(`queryWalletBalances`)
    },
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    },
    onSend() {
      this.$refs.SendModal.open(this.bondDenom)
    }
  },
  apollo: {
    overview: {
      query() {
        /* istanbul ignore next */
        return Overview(this.network, this.session.address)
      },
      variables() {
        /* istanbul ignore next */
        return {
          address: this.session.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.overview
      }
    },
    metaData: {
      query() {
        /* istanbul ignore next */
        return MetaData(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return data.metaData
      }
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
