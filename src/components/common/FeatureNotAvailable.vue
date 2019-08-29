<template>
  <TmDataMsg icon="timeline">
    <div slot="title">{{ feature }} not yet available</div>
    <div slot="subtitle">
      ¯\_(ツ)_/¯<br />
      We are working hard to get this feature into Lunie. If you are super
      exited about using it, write us or tweet about it. We live off feedback.
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
      required: true
    }
  }
}
</script>
