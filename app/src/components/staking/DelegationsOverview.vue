<template>
  <div class="table-container">
    <div
      v-if="$apollo.queries.delegations.loading && !delegationsLoaded"
      class="loading-image-container"
    >
      <img
        class="loading-image"
        src="/img/portfolio-loading.svg"
        alt="geometric placeholder shapes"
      />
    </div>
    <div v-else-if="delegations.length > 0">
      <h1>Your Validators</h1>
      <TableValidators
        :validators="delegations.map(({ validator }) => validator)"
        :delegations="delegations"
        show-on-mobile="expectedReturns"
      />
    </div>
    <TmDataMsg
      v-else-if="delegations.length === 0 && !$apollo.loading"
      icon="sentiment_dissatisfied"
    >
      <div slot="title">No validators in your portfolio</div>
      <div slot="subtitle">
        Head over to the
        <a @click="goToValidators()">validator list</a>&nbsp;to get staking!
      </div>
    </TmDataMsg>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex"
import TmDataMsg from "common/TmDataMsg"
import TableValidators from "staking/TableValidators"
import { DelegationsForDelegator, UserTransactionAdded } from "src/gql"

export default {
  name: `delegations-overview`,
  components: {
    TableValidators,
    TmDataMsg,
  },
  data: () => ({
    delegations: [],
    delegationsLoaded: false,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`address`, `network`, `networks`]),
  },
  methods: {
    goToValidators() {
      this.$router.push({
        name: "Validators",
        params: {
          networkId: this.networks.find(
            (network) => network.id === this.network
          ).slug,
        },
      })
    },
  },
  apollo: {
    delegations: {
      query() {
        /* istanbul ignore next */
        return DelegationsForDelegator(this.network)
      },
      variables() {
        /* istanbul ignore next */
        return {
          delegatorAddress: this.address,
          networkId: this.network,
        }
      },
      /* istanbul ignore next */
      update(data) {
        this.delegationsLoaded = true
        return data.delegations || []
      },
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          return {
            networkId: this.network,
            address: this.address,
          }
        },
        skip() {
          return !this.address
        },
        query: UserTransactionAdded,
        result({ data }) {
          /* istanbul ignore next */
          if (data.userTransactionAddedV2.success) {
            this.$apollo.queries.delegations.refetch()
          }
        },
      },
    },
  },
}
</script>
<style scoped>
h1 {
  font-size: 24px;
  color: var(--bright);
  font-weight: 300;
  padding: 1rem 0 2rem;
}

.table-container {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

@media screen and (max-width: 667px) {
  h1 {
    padding: 2rem;
    text-align: center;
  }

  .loading-image-container {
    padding: 2rem;
  }
}

@media screen and (min-width: 667px) {
  .table-container {
    padding: 2rem;
  }
}
</style>
