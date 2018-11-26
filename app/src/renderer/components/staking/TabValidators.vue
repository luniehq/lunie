<template>
  <table-validators :validators="delegates.delegates" />
</template>

<script>
import TableValidators from "staking/TableValidators"
import { mapGetters } from "vuex"

export default {
  name: `tab-validators`,
  components: {
    TableValidators
  },
  computed: {
    ...mapGetters([`delegates`])
  }
}
</script>
