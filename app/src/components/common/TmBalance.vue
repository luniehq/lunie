<template>
  <div class="balance-header-container">
    <div
      v-if="$apollo.queries.balances.loading"
      class="loading-image-container"
    >
      <img
        src="/img/balance-header-loading.svg"
        alt="geometric placeholder shapes"
      />
    </div>
    <div v-else class="balance-header">
      <div class="header-container">
        <h1>Your Balances</h1>
        <div class="buttons">
          <TmBtn
            v-if="currentNetwork.network_type === `polkadot`"
            class="stake-button"
            value="Stake"
            type="secondary"
            @click.native="onStake()"
          />
          <TmBtn
            v-if="currentNetwork.network_type === `polkadot`"
            class="unstake-button"
            value="Unstake"
            type="secondary"
            @click.native="onUnstake()"
          />
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
          <div v-if="!isTestnet" class="currency-selector">
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
              v-model="preferredCurrency"
              @change="setPreferredCurrency()"
            >
              <option
                v-if="preferredCurrency"
                value=""
                :selected="preferredCurrency"
                hidden
              >
                {{ preferredCurrency }}
              </option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CAD">CAD</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CHF">CHF</option>
              <option value="DKK">DKK</option>
              <option value="NOK">NOK</option>
              <option value="SEK">SEK</option>
            </select>
          </div>
        </div>
      </div>
      <Bar
        v-if="currentNetwork.network_type === 'polkadot'"
        class="reward-bar"
        :show="true"
        bar-type="info"
      >
        Rewards in {{ currentNetwork.title }} are typically distributed by your
        validator. You may not need to claim them to receive them.
      </Bar>

      <TableBalances
        :balances="balances"
        :total-rewards-per-denom="totalRewardsPerDenom"
      />

      <SendModal ref="SendModal" :denoms="getAllDenoms" />
      <ModalWithdrawRewards ref="ModalWithdrawRewards" />
      <DelegationModal ref="StakeModal" />
      <UndelegationModal ref="UnstakeModal" />
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
import DelegationModal from "src/ActionModal/components/DelegationModal"
import UndelegationModal from "src/ActionModal/components/UndelegationModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import ModalTutorial from "common/ModalTutorial"
import TableBalances from "common/TableBalances"
import Bar from "common/Bar"
import { mapGetters, mapState } from "vuex"
import gql from "graphql-tag"
import { sendEvent } from "scripts/google-analytics"
import config from "src/../config"

export default {
  name: `tm-balance`,
  components: {
    TmBtn,
    SendModal,
    DelegationModal,
    UndelegationModal,
    ModalWithdrawRewards,
    ModalTutorial,
    TableBalances,
    Bar,
  },
  filters: {
    noBlanks,
  },
  data() {
    return {
      sentToGA: false,
      rewardsSentToGA: false,
      balances: [],
      showTutorial: false,
      rewards: [],
      preferredCurrency: "USD",
      cosmosTokensTutorial: {
        fullguide: `https://lunie.io/guides/how-to-get-tokens/`,
        background: `red`,
        steps: [
          {
            title: "How to get tokens",
            // Each content array item will be enclosed in a span (newline)
            content: [
              "The easiest way to get tokens is to find a reputable exchange, like Coinbase or Binance, to purchase your tokens from.",
            ],
            affiliate: [
              {
                text:
                  "Need some ATOM to stake with Lunie? Buy some at today at",
                link: config.referralLinks["Coinbase"],
                linkText: "Coinbase",
                onClickFunction: this.sendAffiliateClickEvent,
                onClickParam: "Coinbase",
              },
            ],
          },
          {
            title: "Create your address",
            content: [
              "You can create an address with Lunie using our browser extension, our mobile wallets or a Ledger Nano hardware wallet.",
            ],
          },
          {
            title: "Back it up!",
            content: [
              "When you create an address, ensure your backup code is correct and in a secure place. We don't recommend using an address if you haven't backed it up appropriately.",
            ],
          },
          {
            title: "Send to your address",
            content: [
              "The short version of your address will look something like this: cosmos...7yqp. Make sure to use the full version of your address to successfully receive tokens.",
            ],
          },
          {
            title: "Have more questions?",
            content: [
              "Check out our full guide to getting tokens so you can start staking!",
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapState([`connection`, `session`]),
    ...mapGetters([
      `address`,
      `networks`,
      `network`,
      `stakingDenom`,
      `currentNetwork`,
    ]),
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return Object.values(this.totalRewardsPerDenom).find((value) => value > 0)
    },
    getAllDenoms() {
      if (this.balances.length > 0) {
        const balances = this.balances
        return balances.map(({ denom }) => denom)
      } else {
        return [this.stakingDenom]
      }
    },
    totalRewardsPerDenom() {
      return this.rewards.reduce((all, reward) => {
        return {
          ...all,
          [reward.denom]: parseFloat(reward.amount) + (all[reward.denom] || 0),
        }
      }, {})
    },
    totalRewards() {
      return this.totalRewardsPerDenom[this.stakingDenom] || 0
    },
    isTestnet() {
      return this.networks.find((network) => network.id === this.network)
        .testnet
    },
  },
  watch: {
    totalRewards(totalRewards) {
      if (this.rewards && !this.rewardsSentToGA) {
        this.sendRewards(totalRewards)
      }
    },
  },
  mounted: function () {
    const persistedPreferredCurrency = this.session.preferredCurrency
    if (persistedPreferredCurrency) {
      this.preferredCurrency = persistedPreferredCurrency
    }
  },
  methods: {
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    },
    onSend(denom = undefined) {
      this.$refs.SendModal.open(denom)
    },
    onStake(amount) {
      this.$refs.StakeModal.open()
    },
    onUnstake(amount) {
      this.$refs.UnstakeModal.open()
    },
    openTutorial() {
      this.showTutorial = true
    },
    hideTutorial() {
      this.showTutorial = false
    },
    setPreferredCurrency() {
      this.$store.dispatch(`setPreferredCurrency`, this.preferredCurrency)
    },
    sendRewards(totalRewards) {
      // sending to ga only once
      sendEvent(
        {
          network: this.network,
          address: this.address,
        },
        "Portfolio",
        "Balance",
        "totalRewards",
        totalRewards
      )
      this.rewardsSentToGA = true
    },
    /* istanbul ignore next */
    sendAffiliateClickEvent(partner) {
      sendEvent(
        {
          network: this.network,
          address: this.address,
        },
        "Portfolio",
        "Tutorials",
        `linkTo${partner}`,
        "click"
      )
    },
  },
  apollo: {
    balances: {
      query: gql`
        query($networkId: String!, $address: String!, $fiatCurrency: String) {
          balancesV2(
            networkId: $networkId
            address: $address
            fiatCurrency: $fiatCurrency
          ) {
            id
            type
            denom
            available
            total
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
          fiatCurrency: this.preferredCurrency,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      update(result) {
        return result.balancesV2
      },
    },
    rewards: {
      query: gql`
        query rewards(
          $networkId: String!
          $delegatorAddress: String!
          $fiatCurrency: String
        ) {
          rewards(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            fiatCurrency: $fiatCurrency
          ) {
            id
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address,
          fiatCurrency: this.preferredCurrency,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
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
          this.$apollo.queries.balances.refetch()
          this.$apollo.queries.rewards.refetch()
        },
      },
    },
  },
}
</script>
<style scoped>
.balance-header-container {
  width: 100%;
  background: var(--app-bg);
}

.balance-header {
  margin: 0 auto;
  max-width: 1100px;
}

.loading-image-container {
  padding: 0 2rem 2rem;
}

h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
}

select {
  background: var(--input-bg);
  color: var(--txt);
  border: none;
}

select option {
  background: var(--app-bg);
  color: var(--txt);
  font-family: var(--sans);
}

.currency-selector {
  float: right;
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--primary);
  border-radius: 0.5rem;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--bright);
}

.currency-selector img {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.currency-flag {
  width: 2.5rem;
  height: 2.5rem;
  max-width: 100%;
  object-fit: cover;
  margin-right: 1rem;
  border-radius: 50%;
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
  background: var(--app-fg-hover);
}

.header-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem 2rem 2rem;
  width: 100%;
}

.header-container button {
  margin-right: 0.5rem;
}

.buttons {
  display: flex;
  align-items: center;
}

.open-tutorial {
  justify-self: end;
}

.tutorial-button {
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
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

.reward-bar {
  width: auto;
  margin: 0 2rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding-bottom: 2rem;
  }

  .tutorial-button {
    display: none;
  }

  .header-container {
    flex-direction: column;
    padding: 0 1rem;
  }

  .currency-selector {
    display: none;
  }

  .reward-bar {
    margin: 2rem 2rem;
  }
}

@media screen and (min-width: 1254px) {
  .stake-button,
  .unstake-button,
  .send-button {
    display: none;
  }
}
</style>
