<template>
  <div class="balance-header">
    <div
      v-if="$apollo.queries.overview.loading && !overview.totalStake"
      class="loading-image-container"
    >
      <img
        src="/img/balance-header-loading.svg"
        alt="geometric placeholder shapes"
      />
    </div>
    <div v-else>
      <div class="values-container">
        <div>
          <div class="upper-header">
            <div class="total-atoms">
              <h3>Total {{ stakingDenom }}</h3>
              <h2 class="total-atoms__value">
                {{ overview.totalStake | shortDecimals | noBlanks }}
              </h2>
            </div>
            <button class="tutorial-button" @click="openTutorial()">
              <i v-if="false" class="material-icons">help_outline</i>
              <span v-else>Need some tokens?</span>
            </button>
          </div>
          <div class="scroll">
            <div class="row small-container scroll-item">
              <div v-if="overview.totalStake > 0" class="available-atoms">
                <h3>Available {{ stakingDenom }}</h3>
                <h2>{{ overview.liquidStake | shortDecimals | noBlanks }}</h2>
              </div>

              <div v-if="overview.totalRewards" class="rewards">
                <h3>Total Rewards</h3>
                <h2>+{{ overview.totalRewards | shortDecimals | noBlanks }}</h2>
              </div>
            </div>
            <div
              v-if="formattedBalances.length > 0"
              id="scroll-item"
              class="row small-container tokens-div scroll-item"
            >
              <div
                v-for="balance in formattedBalances"
                :key="balance.denom"
                class="col"
              >
                <p class="token-denom">{{ balance.denom }}</p>
                <p class="token-balance">{{ balance.amount }}</p>
              </div>
            </div>
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
  </div>
</template>
<script>
import { shortDecimals } from "scripts/num"
import { noBlanks } from "src/filters"
import TmBtn from "common/TmBtn"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import { mapGetters, mapState } from "vuex"
import gql from "graphql-tag"
import ModalTutorial from "common/ModalTutorial"

export default {
  name: `tm-balance`,
  components: {
    TmBtn,
    SendModal,
    ModalWithdrawRewards,
    ModalTutorial
  },
  filters: {
    shortDecimals,
    noBlanks
  },
  data() {
    return {
      overview: {},
      stakingDenom: "",
      balances: [],
      selectedTokenFiatValue: `Tokens Total Fiat Value`,
      selectedFiatCurrency: `EUR`, // EUR is our default fiat currency
      showTutorial: false,
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
    formattedBalances() {
      return this.balances
        .filter(balance => !balance.denom.includes(this.stakingDenom))
        .map(
          balance =>
            (balance = {
              denom: balance.denom
                .charAt(0)
                .toLowerCase()
                .concat(balance.denom.slice(-3)),
              amount: parseFloat(balance.amount).toFixed(2)
            })
        )
    },
    concatBalances() {
      let balancesArray = []
      if (this.balances.length > 1) {
        balancesArray = this.balances
          .filter(balance => !balance.denom.includes(this.stakingDenom))
          .map(({ denom, amount }) => ({
            value: ``,
            key: denom.concat(` ` + amount)
          }))
      }
      return balancesArray
    },
    convertedBalances() {
      return this.balances
        .filter(balance => !balance.denom.includes(this.stakingDenom))
        .map(({ denom, fiatValue }) => ({
          value: ``,
          key: denom.concat(` ` + fiatValue)
        }))
    },
    fiatCurrencies() {
      return [
        { key: `EUR`, value: `EUR` },
        { key: `USD`, value: `USD` },
        { key: `GBP`, value: `GBP` },
        { key: `CHF`, value: `CHF` },
        { key: `JPY`, value: `JPY` }
      ]
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
        if (!data.overview) {
          return {
            totalRewards: 0
          }
        }
        return {
          ...data.overview,
          totalRewards: Number(data.overview.totalRewards)
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
            fiatValue
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          fiatCurrency: this.selectedFiatCurrency
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balances || []
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
        }
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
  position: relative;
  padding: 1rem 2rem;
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

.tokens-div {
  position: absolute;
  right: 1.25rem;
  top: 3.5rem;
}

.tokens-div > .col {
  margin-right: 1rem;
}

.token-denom {
  font-size: 12px;
  float: left;
}

.token-balance {
  font-weight: bold;
}

.currency-selector.tm-form-group {
  position: absolute;
  right: 1.25rem;
  top: -0.7rem;
}

.rewards h2 {
  color: var(--success);
  font-size: var(--m);
}

.available-atoms h2 {
  font-size: var(--m);
  line-height: 20px;
}

.upper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.open-tutorial {
  justify-self: end;
}

.tutorial-button {
  padding: 0.5rem 1rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: var(--sans);
  margin-left: auto;
}

.tutorial-button i {
  font-size: 1rem;
}

.tutorial-button span {
  font-size: 14px;
}

.tutorial-button:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

@media screen and (max-width: 667px) {
  .balance-header {
    display: flex;
    flex-direction: column;
  }

  .upper-header {
    flex-direction: column-reverse;
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

  .tutorial-button {
    margin: 0 auto 1rem auto;
  }

  .scroll {
    display: flex;
    width: 90vw;
    overflow-x: auto;
    /* Make it smooth scrolling on iOS devices */
    -webkit-overflow-scrolling: touch;
  }

  .scroll-item {
    width: 100%;
  }

  /* This doesn't work */
  /* .scroll > .scroll-item {
    flex: 0 0 auto;
  } */

  .scroll > .row > div {
    margin-right: 3rem;
  }

  .tokens-div {
    position: inherit;
    margin: 0;
    top: 0;
  }

  .token-denom {
    float: none;
  }

  .currency-selector.tm-form-group {
    width: 40px;
    right: 2.5rem;
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
  .tutorial-container {
    padding-right: 1rem;
  }
}
</style>
