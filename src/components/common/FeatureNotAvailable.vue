<template>
  <TmDataMsg icon="timeline">
    <div slot="title">{{ feature }} not yet available</div>
    <div slot="subtitle">
      ¯\_(ツ)_/¯<br />
      This feature is not supported in Lunie yet. Reach out if you'd like to see support for this feature added to Lunie soon.
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
