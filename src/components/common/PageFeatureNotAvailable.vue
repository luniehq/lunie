<template>
  <TmPage data-title="Feature Not Available" hide-header>
    <TmDataMsg icon="timeline">
      <div slot="title">{{ feature }} not yet available</div>
      <div slot="subtitle">
        ¯\_(ツ)_/¯<br />
        We are working hard to get this feature into Lunie. If you are super
        exited about using it, write us or tweet about it. We live off feedback.
      </div>
    </TmDataMsg>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import TmDataMsg from "common/TmDataMsg"

export default {
  name: `page-not-available`,
  components: {
    TmPage,
    TmDataMsg
  },
  props: {
    feature: {
      type: String,
      required: true
    }
  }
}
</script>