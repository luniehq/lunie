<template lang="pug">
.ni-page
  page-header(:icon='icon' :splash="splash")
    div(slot='title') {{ title }}
    div(slot='subtitle')
      template(v-if="subtitle") {{ subtitle }}
      template(v-else): slot(name="subtitle")
    div(slot="menu"): slot(name="menu")
  main.ni-page-main: slot
  page-footer
</template>

<script>
import PageHeader from "common/NiPageHeader"
import PageFooter from "common/NiPageFooter"
export default {
  name: "ni-page",
  props: ["title", "subtitle", "icon", "splash"],
  components: {
    PageHeader,
    PageFooter
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page
  max-width 64rem
  margin 0 auto
</style>
