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
