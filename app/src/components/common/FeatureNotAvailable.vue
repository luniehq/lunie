<template>
  <TmDataMsg icon="timeline">
    <div slot="title">Feature not available</div>
    <div slot="subtitle">
      We haven't implemented this feature for this network yet.
      <br />
      <br />
      <a class="intercom-button" @click="$store.dispatch(`displayMessenger`)"
        >Reach out if you'd like us to add support for this feature.</a
      >
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `feature-not-available`,
  components: { TmDataMsg },
  props: {
    feature: {
      type: String,
      required: true,
    },
  },
}
</script>
