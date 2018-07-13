<template lang='pug'>
span(class="btn--select-wrapper" :class="[active ? 'active' : '']")
  btn(:value="value")
</template>

<script>
import Btn from "@nylira/vue-button"
export default {
  name: "toggle-btn",
  components: {
    Btn
  },
  props: ["value", "active"]
}
</script>

<style lang="stylus">
@require '~variables'

.btn--select-wrapper.active
  .ti-btn-value
    color app-bg

  .ti-btn-container
    background txt
</style>
