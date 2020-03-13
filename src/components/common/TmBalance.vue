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
      <div class="button-container">
        <h1>Portfolio</h1>
        <div>
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
        <div v-if="currencySupport" class="currency-selector">
          <img
            v-if="preferredCurrency"
            class="currency-flag"
            :src="
              '/img/icons/currencies/' +
                preferredCurrency.toLowerCase() +
                '.png'
            "
            :alt="`${preferredCurrency}` + ' currency'"
          />
          <select
            v-model="selectedFiatCurrency"
            @change="setPreferredCurrency()"
          >
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

      <div class="row values-container lower-header">
        <div class="currency-div">
          <div class="available-atoms">
            <div>
              <div class="icon-and-denom">
                <h3>
                  <img
                    class="currency-flag"
                    src="/img/icons/currencies/lunie.png"
                  />
                  {{ stakingDenom }}
                  <span
                    >{{
                      overview.totalStake | bigFigureOrShortDecimals | noBlanks
                    }}
                  </span>
                </h3>
                <div class="rewards">
                  <h2>+{{ overview.totalRewards }}</h2>
                </div>
              </div>
              <div class="available-container">
                Available
                <span class="available">{{
                  overview.liquidStake | bigFigureOrShortDecimals
                }}</span>
              </div>
            </div>
            <div
              v-if="
                overview.totalStakeFiatValue &&
                  overview.totalStakeFiatValue.amount > 0
              "
              class="fiat-value-box"
            >
              <span>{{
                preferredCurrency +
                  ` ` +
                  overview.totalStakeFiatValue.symbol +
                  bigFigureOrShortDecimals(overview.totalStakeFiatValue.amount)
              }}</span>
            </div>
          </div>
        </div>
        <div v-if="balances">
          <div
            v-for="(balance, index) in filteredMultiDenomBalances"
            :key="balance.denom"
            class="currency-div"
          >
            <div class="available-atoms">
              <div>
                <div class="icon-and-denom">
                  <h3>
                    <img
                      v-if="stakingDenom === balance.denom"
                      class="currency-flag"
                      src="/img/icons/currencies/lunie.png"
                    />
                    <img
                      v-else-if="balance.denom.length > 3"
                      class="currency-flag"
                      :src="
                        '/img/icons/currencies/' +
                          balance.denom.substring(1).toLowerCase() +
                          '.png'
                      "
                      :alt="`${balance.denom}` + ' currency'"
                    />
                    <img
                      v-else
                      class="currency-flag"
                      :src="
                        '/img/icons/currencies/' +
                          balance.denom.toLowerCase() +
                          '.png'
                      "
                      :alt="`${balance.denom}` + ' currency'"
                    />
                    {{ balance.denom }}
                    <span v-if="overview.rewards[index].denom === stakingDenom"
                      >{{
                        overview.totalStake
                          | bigFigureOrShortDecimals
                          | noBlanks
                      }}
                    </span>
                    <span
                      v-if="overview.rewards[index].denom !== stakingDenom"
                      >{{ balance.amount | bigFigureOrShortDecimals }}</span
                    >
                  </h3>
                  <div class="rewards">
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
              <div
                v-if="balance.fiatValue && balance.fiatValue.amount > 0"
                class="fiat-value-box"
              >
                <span>{{
                  preferredCurrency +
                    ` ` +
                    balance.fiatValue.symbol +
                    bigFigureOrShortDecimals(balance.fiatValue.amount)
                }}</span>
              </div>
            </div>
          </div>
        </div>
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
import ModalTutorial from "common/ModalTutorial"
import { mapGetters, mapState } from "vuex"
import uniqBy from "lodash.uniqby"
import gql from "graphql-tag"
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
      showTutorial: false,
      rewards: [],
      selectedFiatCurrency: "USD",
      preferredCurrency: "",
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
      if (this.overview.rewards && this.overview.rewards.length > 0) {
        const uniqRewardsDenoms = uniqBy(
          this.overview.rewards,
          reward => reward.denom
        ).map(reward => reward.denom)
        const allTotalRewards = uniqRewardsDenoms.map(denom =>
          this.calculateTotalRewardsDenom(denom)
        )
        return allTotalRewards.find(reward => parseFloat(reward) > 0.001)
      } else {
        return null
      }
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
    },
    currencySupport() {
      return (
        this.isMultiDenomNetwork &&
        this.stakingBalance &&
        this.stakingBalance.fiatValue
      )
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
        query overview(
          $networkId: String!
          $address: String!
          $fiatCurrency: String!
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
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          fiatCurrency: this.preferredCurrency
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
<style>
h1 {
  font-size: 24px;
  color: white;
  font-weight: 300;
  padding: 0 0 0 1rem;
}

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

.currency-selector {
  display: flex;
  align-items: center;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 400;
  padding: 8px 16px;
  width: auto;
  color: var(--bright);
  border-radius: 0.5rem;
  border: 2px solid var(--primary);
  -webkit-transition: all 0.5s ease;
  transition: all 0.5s ease;
  white-space: nowrap;
}

.currency-selector img {
  width: 1rem;
  height: 1rem;
}

.currency-flag {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 1rem;
}

.fiat-value-box {
  color: var(--txt);
  font-size: 12px;
  padding-left: 0.5rem;
}

.currency-div {
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
}

.currency-div:last-child {
  border-bottom: none;
}

.currency-div:hover {
  background: var(--hover-bg);
}

.balance-header {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.row.values-container {
  display: flex;
  flex-direction: column;
}

.rewards {
  padding-left: 1rem;
  align-self: center;
  font-size: var(--sm);
}

.available-container {
  font-size: 12px;
  padding: 0.25rem 0 0 3rem;
}

.available-atoms {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.available-atoms > div {
  display: flex;
  flex-direction: column;
}

.icon-and-denom {
  display: flex;
  flex-direction: row;
}

.available {
  color: gold;
  padding-left: 0.5rem;
}

.available-atoms h3 {
  color: var(--bright);
  display: flex;
  align-items: center;
}

h3 span {
  padding-left: 0.25rem;
}

p.rewards {
  color: var(--success);
}

.rewards h2 {
  color: var(--success);
}

.lower-header {
  padding: 2rem;
  align-items: normal;
  flex-direction: column;
  background: #272b48;
}

.lower-header .title {
  color: var(--dim);
  font-size: var(--sm);
  padding-bottom: 0.5rem;
}

.button-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 2rem;
  width: 100%;
}

.button-container div {
  display: flex;
  flex-direction: row;
}

.button-container button:first-child {
  margin-right: 0.5rem;
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
  .tutorial-button {
    display: none;
  }

  .values-container {
    padding: 1rem;
  }

  .icon-and-denom {
    width: 100%;
    justify-content: space-between;
  }

  .available-atoms {
    flex-direction: column;
  }

  .fiat-value-box {
    padding-left: 2.5rem;
  }

  .available-atoms > div {
    width: 100%;
  }

  .available-container {
    padding: 0.25rem 0 0 2.5rem;
  }

  .button-container {
    padding: 0 1rem 1rem;
  }

  .button-container div {
    margin-right: 0.5rem;
  }

  .tutorial-container {
    padding-right: 1rem;
  }

  .currency-selector {
    margin-right: 0;
  }

  .currency-selector .currency-flag {
    margin-right: 0.5rem;
  }

  .currency-flag {
    margin-right: 1rem;
  }
}
</style>
