<template lang="pug">
  table-proposals(:proposals="proposals" :loading="proposals.loading")
</template>

<script>
import TableProposals from "governance/TableProposals"
import { mapGetters } from "vuex"
export default {
  name: `tab-proposals`,
  components: {
    TableProposals
  },
  computed: {
    ...mapGetters([`proposals`])
  }
}
</script>
