<template>
  <SessionFrame>
    <div class="select-network">
      <h2 class="session-title">Select a Network</h2>
      <div class="page-networks">
        <PageNetworks :route="`/create`" />
      </div>
    </div>
  </SessionFrame>
</template>

<script>
// import NetworkItem from "network/NetworkItem"
import PageNetworks from "network/PageNetworks"
import SessionFrame from "common/SessionFrame"

export default {
  name: `select-network`,
  components: {
    SessionFrame,
    PageNetworks
  }
}
</script>
<style scoped>
.page-networks {
  overflow: scroll;
}
</style>
