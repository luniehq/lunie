<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>
      <div class="select-networks-list">
        <LiSession
          v-for="network in networks"
          :key="network.title"
          icon="language"
          :title="network.title"
          :route="{ name: 'create', params: { network: network.id } }"
        />
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import LiSession from "common/TmLiSession"
import SessionFrame from "common/SessionFrame"
import gql from "graphql-tag"

export default {
  name: `select-network`,
  components: {
    SessionFrame,
    LiSession
  },
  data: () => ({
    networks: []
  }),
  apollo: {
    networks: {
      query: gql`
        query Networks {
          networks {
            title
            id
          }
        }
      `
    }
  }
}
</script>
