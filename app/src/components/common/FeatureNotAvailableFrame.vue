<template>
  <SessionFrame>
    <TmDataMsg icon="timeline">
      <div slot="title">Feature not available</div>
      <div slot="subtitle">
        This feature hasn't been implemented on this network yet.
        <br />
        <br />
        <a class="intercom-button" href="#"
          >Reach out if you'd like us to enable this feature.</a
        >
      </div>
    </TmDataMsg>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `feature-not-available-frame`,
  components: { SessionFrame, TmDataMsg },
  props: {
    feature: {
      type: String,
      required: true,
    },
  },
}
</script>
