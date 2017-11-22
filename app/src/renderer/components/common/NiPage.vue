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
import PageHeader from './NiPageHeader'
import PageFooter from './NiPageFooter'
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
@require '~@/styles/variables.styl'

.ni-page
  max-width 1024px
  margin 0 auto
</style>
