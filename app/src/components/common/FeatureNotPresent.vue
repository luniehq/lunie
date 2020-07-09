<template>
  <TmDataMsg icon="error" icon-color="var(--dark-grey-blue)">
    <div>
      <i class="material-icons nontranslate">error</i>
    </div>
    <div slot="title">Feature not present</div>
    <div slot="subtitle">
      {{ featureNotPresentMessage }}
      <a :href="guideLink">here</a>
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
import { mapGetters } from "vuex"
import { NetworksAll } from "../../gql"
export default {
  name: `feature-not-present`,
  components: { TmDataMsg },
  data: () => ({
    networks: [],
    guideLink: `https://intercom.help/lunie/en/articles/3824836-lunie-staking-guide-the-e-money-network`,
  }),
  computed: {
    // ...mapGetters({networkId: }),
    ...mapGetters([`stakingDenom`, `network`]),
    featureNotPresentMessage() {
      return `The ${this.networks.title} network does not currently have any existing governance framework for ${this.stakingDenom} token holders. To learn more about this, click`
    },
  },
  apollo: {
    networks: {
      query: NetworksAll,
      update(data) {
        return (
          data.networks.find(({ id }) => id === this.network) || { amount: 0 }
        )
      },
      fetchPolicy: "cache-first",
    },
  },
}
</script>
