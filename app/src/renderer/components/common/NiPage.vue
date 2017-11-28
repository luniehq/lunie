<template lang="pug">
.ni-page
  page-header(:icon='icon')
    div(slot='votes'): slot(name="votes")
    div(slot='title') {{ title }}
    div(slot='subtitle' :class="{ 'push-left': $slots.voteWidget }")
      template(v-if="subtitle") {{ subtitle }}
      template(v-else): slot(name="subtitle")
    div(slot="menu"): slot(name="menu")
  main.ni-page-main: slot
  page-footer
</template>

<script>
import PageHeader from 'common/NiPageHeader'
import PageFooter from 'common/NiPageFooter'
export default {
  name: 'ni-page',
  props: ['title', 'subtitle', 'icon'],
  components: {
    PageHeader,
    PageFooter
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page
  max-width aw
  margin 0 auto

@media screen and (min-width: 768px)
  .ni-page-main
    padding 1rem
</style>
