<template>
  <tm-data-msg icon="info_outline">
    <h4 v-if="title" slot="title">{{ title }}</h4>
    <h4 v-else slot="title">N/A</h4>
    <h5 v-if="subtitle" slot="subtitle">{{ subtitle }}</h5>
    <h5 v-else slot="subtitle">No data available yet.</h5>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "./TmDataMsg.vue"

export default {
  name: `tm-data-empty`,
  components: { TmDataMsg },
  props: {
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    }
  }
}
</script>
