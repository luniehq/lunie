<template>
  <div>
    <TmDataConnecting v-if="!delegates.loaded && !connected" />
    <TmDataLoading v-else-if="!delegates.loaded && delegates.loading" />
    <TmDataEmpty
      v-else-if="delegates.loaded && delegates.delegates.length === 0"
    />
    <TableValidators v-else :validators="delegates.delegates" />
  </div>
</template>

<script>
import TableValidators from "staking/TableValidators"
import TmDataEmpty from "common/TmDataEmpty"
import TmDataLoading from "common/TmDataLoading"
import TmDataConnecting from "common/TmDataConnecting"
import { mapGetters } from "vuex"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmDataEmpty,
    TmDataLoading,
    TmDataConnecting
  },
  data: () => ({
    lastUpdate: 0
  }),
  computed: {
    ...mapGetters([
      `lastHeader`,
      `delegates`,
      `committedDelegations`,
      `connected`,
      `session`,
      `yourValidators`
    ])
  }
}
</script>
