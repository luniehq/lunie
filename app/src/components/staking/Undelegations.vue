<template>
  <div v-if="undelegations.length > 0" class="undelegations">
    <div class="table-container">
      <div
        v-if="$apollo.queries.undelegations.loading && !undelegationsLoaded"
        class="loading-image-container"
      >
        <img
          class="loading-image"
          src="/img/portfolio-loading.svg"
          alt="geometric placeholder shapes"
        />
      </div>
      <div v-else>
        <h1>
          Pending
        </h1>
        <template v-if="currentNetwork.network_type === `polkadot`">
          <BalanceRow
            v-for="balance in balances"
            :key="balance.id"
            :balance="balance"
            :total-rewards-denom="totalRewardsDenom"
          />
        </template>
        <TableUndelegations v-else :undelegations="undelegations" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import BalanceRow from "common/BalanceRow"
import TableUndelegations from "staking/TableUndelegations"
import { ValidatorFragment, UserTransactionAdded } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `undelegations`,
  components: {
    TableUndelegations,
    BalanceRow,
  },
  data: () => ({
    undelegations: [],
    rewards: [],
    undelegationsLoaded: false,
  }),
  computed: {
    ...mapGetters([`address`, `network`, `currentNetwork`]),
    balances() {
      return this.undelegations.map((undelegation) => {
        return {
          ...undelegation,
          total: undelegation.amount,
          denom: this.currentNetwork.stakingDenom,
        }
      })
    },
    totalRewardsDenom() {
      return this.rewards.reduce((all, reward) => {
        return {
          ...all,
          [reward.denom]: parseFloat(reward.amount) + (all[reward.denom] || 0),
        }
      }, {})
    },
  },
  apollo: {
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
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
          delegatorAddress: this.address,
        }
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
          /* istanbul ignore next */
          return {
            networkId: this.network,
            address: this.address,
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.address
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.undelegations.refetch()
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
  padding: 1rem 0 2rem;
}

.undelegations {
  background: var(--app-fg);
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 4rem 2rem;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }
}
</style>
