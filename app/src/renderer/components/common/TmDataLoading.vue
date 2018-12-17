<template lang="pug">
.tm-data-msg
  img.tm-data-msg__icon(src="~assets/images/loader.svg")
  .tm-data-msg__text
    .tm-data-msg__title(slot="title") {{ title }}
    .tm-data-msg__subtitle(slot="subtitle") Please wait a moment.
</template>

<script>
import TmDataMsg from "../TmDataMsg/TmDataMsg.vue"
export default {
  name: "tm-data-loading",
  components: { TmDataMsg },
  props: {
    title: {
      type: String,
      default: "Data is loading…"
    }
  }
}
</script>
