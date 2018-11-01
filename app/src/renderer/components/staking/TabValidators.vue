<template lang="pug">
  table-validators(:validators="delegates.delegates")
</template>

<script>
import TableValidators from "staking/TableValidators"
import { mapGetters } from "vuex"

export default {
  components: {
    TableValidators
  },
  computed: {
    ...mapGetters([`delegates`])
  }
}
</script>
