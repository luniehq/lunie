<template>
  <managed-body
    :connected="connected"
    :loading="delegates.loading"
    :loaded="delegates.loaded"
    :error="delegates.error"
    :data="delegates.delegates"
    :filtered-data="filteredDelegates"
    :search="{ type: `delegates` }"
  >
    <table-validators slot="data-body" :validators="filteredDelegates" />
  </managed-body>
</template>

<script>
import TableValidators from "staking/TableValidators"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import TmDataConnecting from "common/TmDataConnecting"
import { mapGetters } from "vuex"
import ManagedBody from "../common/ManagedBody"
import { includes } from "lodash"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    TmDataEmpty,
    TmDataLoading,
    TmDataConnecting,
    ManagedBody
  },
  computed: {
    ...mapGetters([`delegates`, `connected`, `filters`]),
    filteredDelegates() {
      if (this.filters.delegates.search.visible) {
        let query = this.filters.delegates.search.query || ``
        return this.delegates.delegates.filter(i =>
          includes(JSON.stringify(i).toLowerCase(), query.toLowerCase())
        )
      }
      return this.delegates.delegates
    }
  }
}
</script>
