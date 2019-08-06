<template>
  <TmPage
    :managed="true"
    :loading="delegates.loading"
    :loaded="delegates.loaded"
    :error="delegates.error"
    :data-empty="delegates.length === 0"
    hide-header
  >
    <template slot="managed-body">
      <TableValidators
        :validators="delegates.delegates"
        show-on-mobile="expectedReturns"
      />
    </template>
  </TmPage>
</template>

<script>
import TableValidators from "staking/TableValidators"
import TmPage from "common/TmPage"
import { mapGetters } from "vuex"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmPage
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
