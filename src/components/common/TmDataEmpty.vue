<template>
  <TmDataMsg :icon="icon">
    <template slot="title">
      <slot name="title">
        <h4>
          N/A
        </h4>
      </slot>
    </template>
    <template slot="subtitle">
      <slot name="subtitle">
        <h5>
          No data available yet.
        </h5>
      </slot>
    </template>
  </TmDataMsg>
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
    },
    icon: {
      type: String,
      default: `info_outline`
    }
  }
}
</script>
