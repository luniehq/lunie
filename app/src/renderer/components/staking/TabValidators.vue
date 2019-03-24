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
  computed: {
    ...mapGetters([
      `lastHeader`,
      `delegates`,
      `committedDelegations`,
      `connected`,
      `session`
    ]),
    yourValidators(
      {
        committedDelegations,
        delegates: { delegates },
        session: { signedIn }
      } = this
    ) {
      return (
        signedIn &&
        delegates.filter(
          ({ operator_address }) => operator_address in committedDelegations
        )
      )
    }
  },
  watch: {
    "session.signedIn": function(signedIn) {
      signedIn && this.$store.dispatch(`updateDelegates`)
    },
    lastHeader: {
      immediate: true,
      handler(newHeader) {
        const waitTwentyBlocks = Number(newHeader.height) % 20 === 0
        if (
          waitTwentyBlocks &&
          this.yourValidators &&
          this.yourValidators.length > 0
        ) {
          this.$store.dispatch(
            `getRewardsFromAllValidators`,
            this.yourValidators
          )
        }
      }
    }
  },
  mounted() {
    this.$store.dispatch(`updateDelegates`)
    if (this.yourValidators) {
      this.$store.dispatch(`getRewardsFromAllValidators`, this.yourValidators)
    }
  }
}
</script>
