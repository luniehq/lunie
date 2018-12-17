<template>
  <div class="tm-data-msg">
    <img class="tm-data-msg__icon" src="~assets/images/loader.svg" />
    <div class="tm-data-msg__text">
      <div class="tm-data-msg__title" slot="title">{{ title }}</div>
      <div class="tm-data-msg__subtitle" slot="subtitle">
        Please wait a moment.
      </div>
    </div>
  </div>
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
