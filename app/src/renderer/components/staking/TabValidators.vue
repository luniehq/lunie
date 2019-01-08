<template>
  <div>
    <tm-data-connecting v-if="!delegates.loaded && !connected" />
    <tm-data-loading v-else-if="!delegates.loaded && delegates.loading" />
    <tm-data-empty
      v-else-if="delegates.loaded && validators.validators.length === 0"
    />
    <table-validators v-else :validators="validators.validators" />
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
  computed: {
    ...mapGetters([`validators`, `connected`])
  }
}
</script>
