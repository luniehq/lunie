<template>
  <TmDataMsg icon="newreleases">
    <div slot="title">Feature not present</div>
    <div slot="subtitle">
      This feature doesn't exist on this network.
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `feature-not-present`,
  components: { TmDataMsg }
}
</script>
