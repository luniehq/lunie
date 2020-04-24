<template>
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
    <div v-else-if="undelegations.length > 0" class="undelegations">
      <h1>
        Pending
      </h1>
      <TableUndelegations :undelegations="undelegations" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TableUndelegations from "staking/TableUndelegations"
import { ValidatorFragment, UserTransactionAdded } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `undelegations`,
  components: {
    TableUndelegations
  },
  data: () => ({
    undelegations: [],
    undelegationsLoaded: false
  }),
  computed: {
    ...mapGetters([`address`, `network`])
  },
  apollo: {
    undelegations: {
      query() {
        /* istanbul ignore next */
        return gql`
        query Undelegations($networkId: String!, $delegatorAddress: String!) {
          undelegations(networkId: $networkId, delegatorAddress: $delegatorAddress) {
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
          delegatorAddress: this.address
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.undelegationsLoaded = true
        return data.undelegations
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
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.undelegations.refetch()
          }
        }
      }
    }
  }
}
</script>
<style scoped>
h1 {
  font-size: 24px;
  color: white;
  font-weight: 300;
  padding: 1rem 0 2rem;
}

.undelegations {
  max-width: 1100px;
  margin: 0 auto;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }
}

@media screen and (min-width: 667px) {
  .undelegations {
    padding: 2rem;
  }

  .table-container {
    padding: 2rem;
  }
}
</style>
