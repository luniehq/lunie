<template>
  <div class="balance-header">
    <select v-model="selectedFiatCurrency" @change="setPreferredCurrency()">
      <option
        v-if="!preferredCurrency || preferredCurrency === ''"
        value=""
        disabled
        :selected="!preferredCurrency || preferredCurrency === ''"
        hidden
        >Select your fiat currency</option
      >
      <option
        v-if="preferredCurrency"
        value=""
        :selected="preferredCurrency"
        hidden
        >{{ preferredCurrency }}</option
      >
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
      <option value="GBP">GBP</option>
      <option value="JPY">JPY</option>
      <option value="CHF">CHF</option>
    </select>
    <div
      v-if="$apollo.queries.overview.loading && !overview.totalStake"
      class="loading-image-container"
    ></div>

    <div v-else class="overview">
      <div class="overview-row titles">
        <h3 class="title cell">Total</h3>
        <h2 class="title cell">Balance</h2>
      </div>
      <div class="overview-row">
        <h3 class="cell">
          <img src="" alt="" />{{ stakingDenom }}
          <h2 class="cell">
            {{ overview.totalStake | bigFigureOrShortDecimals | noBlanks }}
            <span v-if="preferredCurrency">{{
              preferredCurrency +
                stakingBalance.fiatValue.symbol +
                bigFigureOrShortDecimals(stakingBalance.fiatValue.amount)
            }}</span>
            <span class="rewards"
              >+{{
                overview.totalRewards | bigFigureOrShortDecimals | noBlanks
              }}</span
            >
          </h2>
        </h3>
        <h2 class="cell available">
          {{ overview.liquidStake | bigFigureOrShortDecimals | noBlanks }}
        </h2>
      </div>
      <template v-if="isMultiDenomNetwork">
        <div
          v-for="balance in filteredMultiDenomBalances"
          :key="balance.denom"
          class="overview-row"
        >
          <h3 class="cell">
            <img
              class="currency-flag"
              :src="
                '/img/icons/currencies/' +
                  balance.denom.substring(1).toLowerCase() +
                  '.png'
              "
              :alt="`${preferredCurrency}` + ' currency'"
            />{{ balance.denom }}
            <h2 class="cell">
              {{ balance.amount | bigFigureOrShortDecimals }}
              <span>{{
                balance.fiatValue.denom +
                  balance.fiatValue.symbol +
                  bigFigureOrShortDecimals(balance.fiatValue.amount)
              }}</span>
              <span class="rewards">
                +{{
                  calculateTotalRewardsDenom(balance.denom)
                    | bigFigureOrShortDecimals
                }}</span
              >
            </h2>
          </h3>
          <h2 class="cell"></h2>
        </div>
      </template>
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

      <!-- <div
          class="row lower-header scroll-item"
          :class="{ 'single-denom-rewards': !isMultiDenomNetwork }"
        >
          <div class="row"></div>

        </div> -->
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
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import ModalTutorial from "common/ModalTutorial"
import { mapGetters, mapState } from "vuex"
import gql from "graphql-tag"
import { sendEvent } from "scripts/google-analytics"

export default {
  name: `tm-balance`,
  components: {
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
      selectedFiatCurrency: "USD",
      preferredCurrency: "USD",
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
    stakingBalance() {
      return this.balances.find(({ denom }) => denom === this.stakingDenom)
    },
    filteredMultiDenomBalances() {
      return this.balances.filter(
        balance => !balance.denom.includes(this.stakingDenom)
      )
    },
    getAllDenoms() {
      if (this.balances.length > 0) {
        const balances = this.balances
        return balances.map(({ denom }) => denom)
      } else {
        return [this.stakingDenom]
      }
    },
    isMultiDenomNetwork() {
      if (this.balances && this.balances.length > 0) {
        return this.balances.find(
          balance => balance.denom !== this.stakingDenom
        )
          ? true
          : false
      } else {
        return false
      }
    }
  },
  mounted() {
    this.setPreferredCurrency()
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
    },
    setPreferredCurrency() {
      localStorage.setItem(`preferredCurrency`, this.selectedFiatCurrency)
      this.preferredCurrency = this.selectedFiatCurrency
    }
  },
  apollo: {
    overview: {
      query: gql`
        query overview($networkId: String!, $address: String!) {
          overview(networkId: $networkId, address: $address) {
            totalRewards
            liquidStake
            totalStake
            rewards {
              amount
              denom
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address
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
          fiatCurrency: this.selectedFiatCurrency || "EUR"
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
select {
  background: var(--input-bg);
  color: var(--txt, #333);
  border: none;
}

select option {
  background: var(--app-bg);
  color: var(--txt);
  font-family: var(--sans);
}

.currency-flag {
  width: 1rem;
  margin-right: 0.25rem;
}

.currency-selector {
  display: flex;
  align-items: center;
}

.total-fiat-value {
  min-width: 2rem;
  margin-top: 0.25rem;
}

.fiat-value-box {
  font-size: 12px;
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--bc);
  color: var(--link);
  border-radius: 1.25rem;
  display: inline-block;
  cursor: pointer;
}

.fiat-value-box:hover {
  color: var(--link-hover);
}

.currency-div {
  border: 1px solid var(--primary-alpha);
  padding: 0.25rem;
  margin-right: 0.5rem;
  border-radius: 0.25rem;
}

.balance-header {
  width: 100%;
}

.overview {
  padding: 1rem 0 2rem;
}

.overview-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
  border-bottom: 1px solid var(--bc-dim);
  padding: 1rem;
}

.overview-row.titles {
  padding: 0 1rem;
}

.overview-row h3 {
  width: 20%;
}

.overview-row h2 {
  width: 40%;
}

.overview-row img {
  display: inline-block;
  margin-right: 1rem;
  background: black;
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
  font-size: 18px;
}

.cell span {
  padding-left: 1rem;
  color: var(--grey);
}

.cell .rewards {
  font-size: 12px;
  padding: 0 1rem;
  color: var(--success);
}

.title {
  font-size: 12px;
  color: var(--dim);
}

.available {
  color: gold;
}
</style>
