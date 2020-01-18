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
        <div class="upper-header">
          <div class="total-atoms">
            <h3>Total {{ stakingDenom }}</h3>
            <h2 class="total-atoms__value">
              {{ overview.totalStake | shortDecimals | noBlanks }}
            </h2>
          </div>
          <TmFormGroup
            v-if="balances && balances.length > 1"
            style="display: none;"
            class="currency-selector"
            field-id="currency"
            field-label="Currency"
          >
            <TmField
              v-model="selectedFiatCurrency"
              :title="`Select your fiat currency`"
              :options="fiatCurrencies"
              :placeholder="selectedFiatCurrency"
              type="select"
            />
          </TmFormGroup>
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
    </div>
  </div>
</template>
<script>
import { shortDecimals } from "scripts/num"
import { noBlanks } from "src/filters"
import TmBtn from "common/TmBtn"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import TmFormGroup from "common/TmFormGroup"
import TmField from "src/components/common/TmField"
import { mapGetters } from "vuex"
import gql from "graphql-tag"

export default {
  name: `tm-balance`,
  components: {
    TmFormGroup,
    TmField,
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
      overview: {},
      stakingDenom: "",
      balances: [],
      selectedTokenFiatValue: `Tokens Total Fiat Value`,
      selectedFiatCurrency: `EUR` // EUR is our default fiat currency
    }
  },
  computed: {
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
      skip() {
        return !this.address
      },
      /* istanbul ignore next */
      update(data) {
        return data.balances || []
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

  .scroll {
    display: flex;
    width: 90vw;
    overflow-x: auto;
    /* Make it smooth scrolling on iOS devices */
    -webkit-overflow-scrolling: touch;
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
}
</style>
