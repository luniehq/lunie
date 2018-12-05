<template>
  <div>
    <tm-data-connecting v-if="!delegates.loaded && !connected" />
    <tm-data-loading v-else-if="!delegates.loaded && delegates.loading" />
    <tm-data-empty
      v-else-if="delegates.loaded && delegates.delegates.length === 0"
    />
    <table-validators v-else :validators="delegates.delegates" />
  </div>
</template>

<script>
import TableValidators from "staking/TableValidators"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
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
  computed: {
    ...mapGetters([`delegates`, `connected`])
  }
}
</script>
