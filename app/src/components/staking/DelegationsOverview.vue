<template>
  <div class="delegations-overview">
    <div class="table-container">
      <div
        v-if="$apollo.queries.delegations.loading && !delegationsLoaded"
        class="loading-image-container"
      >
        <img
          class="loading-image"
          src="/img/portfolio-loading.svg"
          alt="geometric placeholder shapes"
        />
      </div>
      <div v-else-if="delegations.length > 0">
        <h1>Your Stake</h1>
        <BalanceRow
          :balance="stakedBalance"
          :unstake="currentNetwork.network_type === 'polkadot'"
        />
        <TableValidators
          :validators="delegations.map(({ validator }) => validator)"
          :delegations="delegations"
          class="table-validators"
          show-on-mobile="expectedReturns"
        />
      </div>
      <TmDataMsg
        v-else-if="delegations.length === 0 && !$apollo.loading"
        icon="sentiment_dissatisfied"
      >
        <div slot="title">No validators in your portfolio</div>
        <div slot="subtitle">
          Head over to the
          <a @click="goToValidators()">validator list</a>&nbsp;to get staking!
        </div>
      </TmDataMsg>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import BalanceRow from "common/BalanceRow"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import {
  ValidatorFragment,
  DelegationsForDelegator,
  UserTransactionAdded,
} from "src/gql"
import gql from "graphql-tag"

export default {
  name: `delegations-overview`,
  components: {
    BalanceRow,
    TableValidators,
    TmDataMsg,
  },
  data: () => ({
    delegations: [],
    undelegations: [],
    balances: [],
    delegationsLoaded: false,
    undelegationsLoaded: false,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`address`, `currentNetwork`]),
    stakedBalance() {
      // balances not loaded yet
      if (!this.balances.length) {
        return {
          total: 0,
          denom: this.currentNetwork.stakingDenom,
        }
      }
      const stakingDenomBalance = this.balances.find(
        ({ denom }) => denom === this.currentNetwork.stakingDenom
      )
      let stakedAmount =
        Number(stakingDenomBalance.total) -
        Number(stakingDenomBalance.available)
      // substract the already unbonding balance in the case of Substrate networks.
      if (this.undelegationsLoaded && this.undelegations.length > 0) {
        stakedAmount = this.undelegations.reduce(
          (stakedAmount, { amount }) => stakedAmount - Number(amount),
          stakedAmount
        )
      }
      return {
        total: stakedAmount.toFixed(3),
        denom: this.currentNetwork.stakingDenom,
      }
    },
  },
  methods: {
    goToValidators() {
      this.$router.push({
        name: "validators",
        params: {
          networkId: this.currentNetwork.slug,
        },
      })
    },
  },
  apollo: {
    balances: {
      query: gql`
        query($networkId: String!, $address: String!) {
          balancesV2(networkId: $networkId, address: $address) {
            id
            type
            denom
            available
            total
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          address: this.address,
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
    delegations: {
      query() {
        /* istanbul ignore next */
        return DelegationsForDelegator(this.currentNetwork.id)
      },
      variables() {
        /* istanbul ignore next */
        return {
          delegatorAddress: this.address,
          networkId: this.currentNetwork.id,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.delegationsLoaded = true
        return data.delegations || []
      },
    },
    undelegations: {
      query() {
        /* istanbul ignore next */
        return gql`
        query undelegations($networkId: String!, $delegatorAddress: String!) {
          undelegations(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            id
            validator {
              ${ValidatorFragment}
            }
            amount
            startHeight
            endTime
          }
        }
      `
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      skip() {
        return this.currentNetwork.network_type !== `polkadot` // we only need undelegations for Polkadot networks
      },
      /* istanbul ignore next */
      update(data) {
        this.undelegationsLoaded = true
        return data.undelegations
      },
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          return {
            networkId: this.currentNetwork.id,
            address: this.address,
          }
        },
        skip() {
          return !this.address
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.delegations.refetch()
          }
        },
      },
    },
  },
}
</script>
<style scoped>
h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 400;
  padding-bottom: 2rem;
}

.delegations-overview {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 4rem 2rem;
}

.table-validators {
  margin-top: 2rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .loading-image-container {
    padding: 2rem;
  }

  .table-container {
    padding: 4rem 1rem;
  }
}
</style>
