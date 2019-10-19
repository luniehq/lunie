<template>
  <div v-if="undelegations">
    <h3 class="tab-header">
      Pending Undelegations
    </h3>
    <TableUndelegations :undelegations="undelegations" />
  </div>
</template>

<script>
import { mapState } from "vuex"
import TableUndelegations from "staking/TableUndelegations"
import { UndelegationsForDelegator } from "src/gql"

export default {
  name: `undelegations`,
  components: {
    TableUndelegations
  },
  computed: {
    ...mapState([`session`]),
    ...mapState({
      network: state => state.connection.network
    })
  },
  apollo: {
    undelegations: {
      query() {
        return UndelegationsForDelegator(this.network)
      },
      variables() {
        return {
          delegatorAddress: this.session.address
        }
      },
      update(data) {
        return data.undelegations
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
