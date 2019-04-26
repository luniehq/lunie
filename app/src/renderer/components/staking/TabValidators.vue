<template>
  <data-view
    :loaded="delegates.loaded"
    :loading="delegates.loading"
    :error="delegates.error"
    :data-empty="delegates.delegates.length === 0"
  >
    <table-validators slot="data" :validators="delegates.delegates" />
  </data-view>
</template>

<script>
import TableValidators from "staking/TableValidators"
import DataView from "common/DataView"
import { mapGetters } from "vuex"

export default {
  name: `tab-validators`,
  components: {
    TableValidators,
    DataView
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
  },
  watch: {
    "session.signedIn": function(signedIn) {
      signedIn && this.$store.dispatch(`updateDelegates`)
    },
    lastHeader: {
      immediate: true,
      handler() {
        this.$store.dispatch(`getRewardsFromMyValidators`)
      }
    }
  },
  mounted() {
    this.$store.dispatch(`updateDelegates`)
    if (this.yourValidators) {
      this.$store.dispatch(`getRewardsFromMyValidators`, this.yourValidators)
    }
  }
}
</script>
