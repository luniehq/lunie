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
        <div class="total-atoms">
          <h3>Total {{ stakingDenom }}</h3>
          <h2 class="total-atoms__value">
            {{ overview.totalStake | shortDecimals | noBlanks }}
          </h2>
        </div>
        <div v-if="overview.balances" class="row small-container">
          <div class="col">
            <h3>Total Tokens</h3>
            <h2>
              <TmField
                id="balance"
                :options="balances"
                :placeholder="totalFiatValue"
                type="select"
                :is-disabled="true"
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

      <SendModal ref="SendModal" :denom="stakingDenom" />
      <ModalWithdrawRewards ref="ModalWithdrawRewards" />
    </div>
  </div>
</template>
<script>
import { shortDecimals } from "scripts/num"
import refetchNetworkOnly from "scripts/refetch-network-only"
import { noBlanks } from "src/filters"
import TmBtn from "common/TmBtn"
import SendModal from "src/ActionModal/components/SendModal"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"
import TmField from "src/components/common/TmField"
import { UserTransactionAdded } from "src/gql"
import { mapGetters } from "vuex"
import gql from "graphql-tag"
export default {
  name: `tm-balance`,
  components: {
    TmBtn,
    TmField,
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
      totalFiatValue: `Tokens Total Fiat Value`
    }
  },
  computed: {
    ...mapGetters([`address`, `network`]),
    // only be ready to withdraw of the validator rewards are loaded and the user has rewards to withdraw
    // the validator rewards are needed to filter the top 5 validators to withdraw from
    readyToWithdraw() {
      return this.overview.totalRewards > 0
    },
    balances() {
      let balances = this.overview.balances
      return balances.map(({ denom, amount }) => ({
        value: ``,
        key: denom.concat(` ` + amount)
      }))
    }
  },
  mounted() {
    setTimeout(() => {
      this.totalFiatValue = this.calculateTotalFiatValue()
    }, 1000)
  },
  methods: {
    onWithdrawal() {
      this.$refs.ModalWithdrawRewards.open()
    },
    onSend() {
      this.$refs.SendModal.open()
    },
    // This function will receive the desired fiat currency to display as a parameter
    // Right now it is EUR by default
    async calculateTotalFiatValue() {
      // When e-Money goes live they will count with a trading platform where the value
      // for the different backed tokens will be changing slightly.
      // They will provide with an API for us to query these values.
      // For now we will assume a 1:1 ratio and treat each token like it were the real
      // fiat currency it represents.

      // First we filter out the NGM balance and get the real fiat currencies names
      if (this.overview.balances) {
        const fiatBalances = this.overview.balances
          .filter(({ denom }) => !denom.includes(`NGM`))
          .map(({ denom, amount }) => ({
            denom: denom.substr(2),
            amount
          }))
        // Now we use the public API https://exchangeratesapi.io/ to add all balances into
        // a single fiat currency value
        const allTickers = fiatBalances
          .map(({ denom }) => denom)
          .filter(denom => denom !== `EUR`)
          .join(`,`)
        const exchangeRates = await this.fetchExchangeRates(allTickers)

        const tickersKeyMap = Object.keys(exchangeRates.rates)
        const tickersValueMap = Object.values(exchangeRates.rates)
        let totalFiatValue = 0
        this.overview.balances.forEach(({ denom, amount }) => {
          // in case it is Euro, we add it directly
          if (denom.includes(`EUR`)) {
            totalFiatValue += parseFloat(amount)
          } else {
            tickersKeyMap.forEach((ticker, index) => {
              if (denom.includes(ticker)) {
                totalFiatValue += parseFloat(amount) / tickersValueMap[index]
              }
            })
          }
        })
        this.totalFiatValue = totalFiatValue
          .toFixed(6)
          .toString()
          .concat(` €`)
      }
    },
    async fetchExchangeRates(allTickers) {
      return await fetch(
        `https://api.exchangeratesapi.io/latest?&symbols=${allTickers}`
      )
        .then(r => r.json())
        .catch(error => console.error(error))
    }
  },
  apollo: {
    overview: {
      query: gql`
        query overview($networkId: String!, $address: String!) {
          overview(networkId: $networkId, address: $address) {
            totalRewards
            liquidStake
            balances {
              denom
              amount
            }
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
      variables() {
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
          return {
            networkId: this.network,
            address: this.address
          }
        },
        skip() {
          return !this.address
        },
        query: UserTransactionAdded,
        result() {
          // query if successful or not as even an unsuccessful tx costs fees
          refetchNetworkOnly(this.$apollo.queries.overview)
        }
      },
      blockAdded: {
        variables() {
          return {
            networkId: this.network
          }
        },
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
        result() {
          refetchNetworkOnly(this.$apollo.queries.overview)
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
