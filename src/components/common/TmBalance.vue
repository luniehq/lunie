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
                {{ overview.totalStake | bigFigureOrShortDecimals | noBlanks }}
              </h2>
            </div>
            <button
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
            </button>
          </div>
          <div class="scroll">
            <div
              class="row lower-header scroll-item"
              :class="{ 'single-denom-rewards': !isMultiDenomNetwork }"
            >
              <div class="row">
                <div v-if="overview.totalStake > 0" class="available-atoms">
                  <h3>Available {{ stakingDenom }}</h3>
                  <h2>
                    {{
                      overview.liquidStake | bigFigureOrShortDecimals | noBlanks
                    }}
                  </h2>
                  <div class="rewards multi-denom">
                    <h2
                      v-if="
                        isMultiDenomNetwork && overview.totalRewards > 0.001
                      "
                    >
                      +{{
                        overview.totalRewards
                          | bigFigureOrShortDecimals
                          | noBlanks
                      }}
                    </h2>
                  </div>
                </div>

                <div
                  v-if="
                    !isMultiDenomNetwork &&
                      overview.totalRewards &&
                      overview.totalRewards > 0.001
                  "
                  class="rewards"
                >
                  <h3>Total Rewards</h3>
                  <h2>
                    +{{
                      overview.totalRewards
                        | bigFigureOrShortDecimals
                        | noBlanks
                    }}
                  </h2>
                </div>
              </div>

              <div v-if="isMultiDenomNetwork" class="row values-container">
                <div
                  v-for="balance in filteredMultiDenomBalances"
                  :key="balance.denom"
                >
                  <div class="available-atoms">
                    <h3>
                      {{ balance.denom }}
                    </h3>
                    <h2>
                      {{ balance.amount | bigFigureOrShortDecimals }}
                    </h2>
                  </div>
                  <div class="rewards multi-denom">
                    <h2
                      v-if="calculateTotalRewardsDenom(balance.denom) > 0.001"
                    >
                      +{{
                        calculateTotalRewardsDenom(balance.denom)
                          | bigFigureOrShortDecimals
                      }}
                    </h2>
                  </div>
                </div>
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
import { bigFigureOrShortDecimals } from "scripts/num"
import { noBlanks } from "src/filters"
import TmBtn from "common/TmBtn"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import { mapGetters, mapState } from "vuex"
import gql from "graphql-tag"
import ModalTutorial from "common/ModalTutorial"
import { sendEvent } from "scripts/google-analytics"

export default {
  name: `tm-balance`,
  components: {
    TmBtn,
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
      selectedTokenFiatValue: `Tokens Total Fiat Value`,
      selectedFiatCurrency: `EUR`, // EUR is our default fiat currency
      showTutorial: false,
      rewards: [],
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
    filteredMultiDenomBalances() {
      return this.balances.filter(
        balance => !balance.denom.includes(this.stakingDenom)
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
        .map(({ denom }) => ({
          value: ``,
          // key: denom.concat(` ` + fiatValue)
          key: denom
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
  display: flex;
  flex-direction: column;
  width: 100%;
}

.values-container {
  position: relative;
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

p.rewards {
  color: var(--success);
  font-size: var(--s);
}

.rewards h2 {
  color: var(--success);
  font-size: var(--m);
}

.rewards.multi-denom h2 {
  font-size: 12px;
}

.available-atoms h2 {
  font-size: var(--m);
  line-height: 20px;
}

.upper-header {
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lower-header {
  padding: 2rem;
  align-items: normal;
  flex-direction: row;
  justify-content: space-between;
}

.button-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 2rem;
  width: 100%;
  border-bottom: 1px solid var(--bc-dim);
  border-top: 1px solid var(--bc-dim);
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.button-container button:first-child {
  margin-right: 0.5rem;
}

.row {
  display: flex;
  flex-direction: row;
}

.row div {
  white-space: nowrap;
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

  .values-container .total-atoms__value {
    font-size: 28px;
    font-weight: 500;
    line-height: 32px;
  }

  .total-atoms {
    padding: 1rem 0;
    text-align: center;
  }

  .single-denom-rewards {
    justify-content: center;
    text-align: center;
  }

  .single-denom-rewards .rewards {
    padding-right: 0;
  }

  .single-denom-rewards .available-atoms {
    padding-right: 4rem;
  }

  .tutorial-button {
    margin: 0 auto 1rem auto;
  }

  .button-container {
    width: 100%;
    padding: 1rem;
    border-top: 1px solid var(--bc);
    margin-top: 0rem;
  }

  .button-container button {
    width: 50%;
  }

  .tutorial-container {
    padding-right: 1rem;
  }
}

@media screen and (max-width: 1023px) {
  .scroll {
    display: flex;
    width: 100vw;
    overflow-x: auto;
    /* Make it smooth scrolling on iOS devices */
    -webkit-overflow-scrolling: touch;
  }

  .scroll-item {
    width: 100%;
  }
}
</style>
