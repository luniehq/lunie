<template>
  <div>
    <TmDataConnecting v-if="!delegates.loaded && !connected" />
    <TmDataLoading v-else-if="!delegates.loaded && delegates.loading" />
    <TmDataEmpty
      v-else-if="delegates.loaded && delegates.delegates.length === 0"
    />
    <TableValidators
      v-else
      :validators="validators"
      show-on-mobile="expectedReturns"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import TableValidators from "staking/TableValidators"
import TmDataEmpty from "common/TmDataEmpty"
import TmDataLoading from "common/TmDataLoading"
import TmDataConnecting from "common/TmDataConnecting"
import { AllValidators, AllValidatorsResult } from "src/gql"


export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmDataEmpty,
    TmDataLoading,
    TmDataConnecting
  },
  data: () => ({
    lastUpdate: 0,
    validators: []
  }),
  computed: {
    ...mapState([`session`, `delegates`]),
    ...mapGetters([`lastHeader`, `connected`,])
  },
  apollo: {
    validators: {
      query: AllValidators,
      update: AllValidatorsResult
    }
  }
}
</script>
