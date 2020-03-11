<template>
  <div class="balance-header">
    <CurrencySelector :visible="stakingDenom === `NGM`" />
    <div
      v-if="$apollo.queries.overview.loading && !overview.totalStake"
      class="loading-image-container"
    ></div>

    <div v-else class="overview">
      <div class="overview-row titles">
        <h3 class="title cell total">Total</h3>
        <h2 class="title cell">Rewards</h2>
        <h2 class="title cell">Available</h2>
        <h2 class="title cell"></h2>
      </div>

      <ul v-if="overview && !overview.totalStakeFiatValue">
        <BalanceRow
          :crypto-amount="overview.totalStake"
          :crypto-denom="stakingDenom"
          :rewards-amount="overview.totalRewards"
          :available-amount="overview.liquidStake"
        />
      </ul>

      <ul v-if="overview.totalStakeFiatValue">
        <BalanceRow
          :crypto-amount="overview.totalStake"
          :crypto-denom="stakingDenom"
          :fiat-denom="overview.totalStakeFiatValue.denom"
          :fiat-symbol="overview.totalStakeFiatValue.symbol"
          :fiat-amount="overview.totalStakeFiatValue.amount"
          :rewards-amount="overview.totalRewards"
          :available-amount="overview.liquidStake"
        />
      </ul>

      <span v-if="filteredMultiDenomBalances">
        <ul v-for="balance in filteredMultiDenomBalances" :key="balance.denom">
          <BalanceRow
            :crypto-amount="balance.amount"
            :crypto-denom="balance.denom"
            :fiat-denom="balance.fiatValue.denom"
            :fiat-symbol="balance.fiatValue.symbol"
            :fiat-amount="balance.fiatValue.amount"
          />
        </ul>
      </span>

      <!-- <button
        v-if="
          connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet'
        "
        class="tutorial-button"
        @click="openTutorial()"
      >
        <i v-if="false" class="material-icons notranslate">
          help_outline
        </i>
        <span v-else>Need some tokens?</span>
      </button> -->
    </div>
    <!-- <div class="button-container">
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
    </div> -->

    <SendModal ref="SendModal" :denoms="getAllDenoms" />
    <ModalWithdrawRewards ref="ModalWithdrawRewards" />
    <ModalTutorial
      v-if="
        showTutorial &&
          (connection.network === 'cosmos-hub-mainnet' ||
            connection.network === 'cosmos-hub-testnet')
      "
      :steps="cosmosTokensTutorial.steps"
      :fullguide="cosmosTokensTutorial.fullguide"
      :background="cosmosTokensTutorial.background"
      :close="hideTutorial"
    />
  </div>
</template>
<script>
import { bigFigureOrShortDecimals } from "scripts/num"
import { noBlanks } from "src/filters"
// import TmBtn from "common/TmBtn"
import BalanceRow from "common/BalanceRow"
import CurrencySelector from "common/CurrencySelector"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import ModalTutorial from "common/ModalTutorial"
import { mapGetters, mapState } from "vuex"
import gql from "graphql-tag"
import { sendEvent } from "scripts/google-analytics"

export default {
  name: `tm-balance`,
  components: {
    BalanceRow,
    CurrencySelector,
    // TmBtn,
    SendModal,
    ModalWithdrawRewards,
    ModalTutorial
  },
  filters: {
    bigFigureOrShortDecimals,
    noBlanks
  },
  data() {
    return {
      overview: {},
      stakingDenom: "",
      sentToGA: false,
      balances: [],
      showTutorial: false,
      rewards: [],
      selectedCurrency: `USD`,
      cosmosTokensTutorial: {
        fullguide: `https://lunie.io/guides/how-to-get-tokens/`,
        background: `red`,
        steps: [
          {
            title: "How to get tokens",
            // Each content array item will be enclosed in a span (newline)
            content: [
              "The easiest way to get tokens is to find a reputable exchange, like Coinbase or Binance, to purchase your tokens from."
            ]
          },
          {
            title: "Create your address",
            content: [
              "You can create an address with Lunie using our browser extension, our mobile wallets or a Ledger Nano hardware wallet."
            ]
          },
          {
            title: "Back it up!",
            content: [
              "When you create an address, ensure your backup code is correct and in a secure place. We don't recommend using an address if you haven't backed it up appropriately."
            ]
          },
          {
            title: "Send to your address",
            content: [
              "The short version of your address will look something like this: cosmos...7yqp. Make sure to use the full version of your address to successfully receive tokens."
            ]
          },
          {
            title: "Have more questions?",
            content: [
              "Check out our full guide to getting tokens so you can start staking!"
            ]
          }
        ]
      }
    }
  },
  computed: {
    ...mapState([`connection`]),
    ...mapGetters([`address`, `network`]),
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.overview.totalRewards > 0
    },
    stakingValue() {
      const stakingBalance = this.balances.find(
        ({ denom }) => denom === this.stakingDenom
      )
      if (stakingBalance && stakingBalance.fiatValue) {
        return (
          this.selectedCurrency +
          " " +
          stakingBalance.fiatValue.symbol +
          bigFigureOrShortDecimals(stakingBalance.fiatValue.amount)
        )
      } else {
        return ""
      }
    },
    filteredMultiDenomBalances() {
      const balances = this.balances.filter(
        balance => !balance.denom.includes(this.stakingDenom)
      )
      return balances
    },
    getAllDenoms() {
      if (this.balances.length > 0) {
        const balances = this.balances
        return balances.map(({ denom }) => denom)
      } else {
        return [this.stakingDenom]
      }
    }
  },
  methods: {
    bigFigureOrShortDecimals,
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    },
    onSend() {
      this.$refs.SendModal.open()
    },
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
      this.showTutorial = false
    },
    calculateTotalRewardsDenom(denom) {
      if (this.overview.rewards && this.overview.rewards.length > 0) {
        let rewardsAccumulator = 0
        this.overview.rewards
          .filter(reward => reward.denom === denom)
          .forEach(reward => {
            rewardsAccumulator += parseFloat(reward.amount)
          })
        return rewardsAccumulator
      }
    }
  },
  apollo: {
    overview: {
      query: gql`
        query overview(
          $networkId: String!
          $address: String!
          $fiatCurrency: String
        ) {
          overview(
            networkId: $networkId
            address: $address
            fiatCurrency: $fiatCurrency
          ) {
            totalRewards
            liquidStake
            totalStake
            totalStakeFiatValue {
              amount
              denom
              symbol
            }
            rewards {
              amount
              denom
              fiatValue {
                amount
                denom
                symbol
              }
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          fiatCurrency: this.selectedCurrency
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (!this.sentToGA) {
          // sending to ga only once
          sendEvent(
            {
              network: this.network,
              address: this.address
            },
            "Portfolio",
            "Balance",
            "liquidStake",
            data.overview.liquidStake
          )
          sendEvent(
            {
              network: this.network,
              address: this.address
            },
            "Portfolio",
            "Balance",
            "totalStake",
            data.overview.totalStake
          )
          sendEvent(
            {
              network: this.network,
              address: this.address
            },
            "Portfolio",
            "Balance",
            "totalRewards",
            data.overview.totalRewards
          )
          this.sentToGA = true
        }
        if (!data.overview) {
          return {
            totalRewards: 0
          }
        }
        return {
          ...data.overview,
          totalRewards: Number(data.overview.totalRewards),
          rewards: data.overview.rewards
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      }
    },
    balances: {
      query: gql`
        query balances(
          $networkId: String!
          $address: String!
          $fiatCurrency: String
        ) {
          balances(
            networkId: $networkId
            address: $address
            fiatCurrency: $fiatCurrency
          ) {
            denom
            amount
            fiatValue {
              amount
              denom
              symbol
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          fiatCurrency: this.selectedCurrency
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      }
    },
    stakingDenom: {
      query: gql`
        query Network($networkId: String!) {
          network(id: $networkId) {
            id
            stakingDenom
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (!data.network) return ""
        return data.network.stakingDenom
      }
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network
          }
        },
        /* istanbul ignore next */
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
                chainId
              }
            }
          `
        },
        /* istanbul ignore next */
        result() {
          /* istanbul ignore next */
          this.$apollo.queries.overview.refetch()
          this.$apollo.queries.balances.refetch()
        }
      }
    }
  }
}
</script>
<style scoped>
.balance-header {
  width: 100%;
  background: var(--app-bg);
}

.overview {
  padding: 2rem 0;
}

.overview-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
  border-bottom: 1px solid var(--bc-dim);
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.overview-row.titles {
  padding: 0 1rem;
}

.overview-row h3 {
  width: 30%;
}

.overview-row h2 {
  width: 23.3%;
}

.overview-row img {
  display: inline-block;
  margin-right: 1rem;
  background: var(--dim);
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.overview-row:first-child,
.overview-row:last-child {
  border-bottom: none;
}

.cell {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
  color: white;
  font-size: 16px;
  font-weight: 400;
}

.cell.total {
  padding-left: 4rem;
}

.title {
  font-size: 12px;
  color: var(--dim);
}
</style>
