<template>
  <div
    v-if="!$apollo.queries.undelegations.loading && undelegations.length > 0"
  >
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
        return UndelegationsForDelegator(this.network)
      },
      variables() {
        return {
          delegatorAddress: this.address
        }
      },
      update(data) {
        return data.undelegations
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
        result({ data }) {
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
