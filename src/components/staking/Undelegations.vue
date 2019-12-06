<template>
  <div v-if="undelegations.length > 0">
    <h3 class="tab-header">
      Pending Undelegations
    </h3>
    <TableUndelegations :undelegations="undelegations" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TableUndelegations from "staking/TableUndelegations"
import refetchNetworkOnly from "scripts/refetch-network-only"
import { UndelegationsForDelegator, UserTransactionAdded } from "src/gql"

export default {
  name: `undelegations`,
  components: {
    TableUndelegations
  },
  data: () => ({
    undelegations: []
  }),
  computed: {
    ...mapGetters([`address`, `network`])
  },
  apollo: {
    undelegations: {
      query() {
        /* istanbul ignore next */
        return UndelegationsForDelegator(this.network)
      },
      variables() {
        /* istanbul ignore next */
        return {
          delegatorAddress: this.address
        }
      },
      update(data) {
        /* istanbul ignore next */
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
          if (data.userTransactionAdded.success) {
            refetchNetworkOnly(this.$apollo.queries.undelegations)
          }
        }
      }
    }
  }
}
</script>
<style>
.tab-header {
  margin-top: 2rem;
  margin-bottom: 1rem;
  margin-left: 2rem;
}
</style>
