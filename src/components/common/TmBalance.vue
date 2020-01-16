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
            class="currency-selector"
            field-id="currency"
            field-label="Currency"
          >
            <TmField
              v-model="selectedFiatCurrency"
              :title="`Select your fiat currency`"
              :options="fiatCurrencies"
              placeholder="Select your currency..."
              type="select"
            />
          </TmFormGroup>
        </div>
        <div v-if="balances && balances.length > 1" class="row small-container">
          <div class="col">
            <h3>Total Tokens</h3>
            <h2>
              <TmField
                id="balance"
                :title="`All your token balances`"
                :options="
                  convertedBalances.length > 1
                    ? convertedBalances
                    : concatBalances
                "
                :placeholder="selectedTokenFiatValue"
                type="select"
              />
            </h2>
          </div>
        </div>
        <div class="row small-container">
          <div v-if="overview.totalStake > 0" class="available-atoms">
            <h3>Available {{ stakingDenom }}</h3>
            <h2>{{ overview.liquidStake | shortDecimals | noBlanks }}</h2>
          </div>

          <div v-if="overview.totalRewards" class="rewards">
            <h3>Total Rewards</h3>
            <h2>+{{ overview.totalRewards | shortDecimals | noBlanks }}</h2>
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
import { UserTransactionAdded } from "src/gql"
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
      balancesWithFiat: [],
      selectedTokenFiatValue: `Tokens Total Fiat Value`,
      selectedFiatCurrency: ``,
      convertedBalances: []
    }
  },
  computed: {
    ...mapGetters([`address`, `network`]),
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.overview.totalRewards > 0
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
      if (this.balances) {
        const balances = this.balances
        return balances.map(({ denom }) => denom)
      } else {
        return [this.stakingDenom]
      }
    }
  },
  watch: {
    balancesWithFiat: function() {
      this.convertedBalances = this.balancesWithFiat
        .filter(balance => !balance.denom.includes(this.stakingDenom))
        .map(({ denom, fiatValue }) => ({
          value: ``,
          key: denom.concat(` ` + fiatValue)
        }))
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          address: this.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return {
          ...data.overview,
          totalRewards: Number(data.overview.totalRewards)
        }
      },
      skip() {
        /* istanbul ignore next */
        return !this.address
      }
    },
    balances: {
      query: gql`
        query balances($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            denom
            amount
          }
        }
      `,
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          address: this.address
        }
      },
      skip() {
        /* istanbul ignore next */
        return !this.address
      }
    },
    balancesWithFiat: {
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          address: this.address,
          fiatCurrency: this.selectedFiatCurrency
        }
      },
      skip() {
        /* istanbul ignore next */
        return !this.address || !this.selectedFiatCurrency
      },
      update(data) {
        /* istanbul ignore next */
        return data.balances
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.network.stakingDenom
      }
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network,
            address: this.address
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.address
        },
        query: UserTransactionAdded,
        result() {
          // query if successful or not as even an unsuccessful tx costs fees
          this.$apollo.queries.overview.refetch()
        }
      },
      blockAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network
          }
        },
        query() {
          /* istanbul ignore next */
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
                chainId
              }
            }
          `
        },
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
