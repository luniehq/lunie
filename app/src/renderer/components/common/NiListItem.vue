<template lang="pug">
transition(name="proposal")
  a.ni-li(v-if="type==='anchor'"): .ni-li-container
    .ni-li-thumb
      template(v-if='icon'): i.material-icons {{ icon }}
      template(v-else-if='image'): img(:src='image')
      template(v-else-if="$slots['graphic']"): slot(name='graphic')
    .ni-li-label
      .ni-li-title {{ title }}
      .ni-li-subtitle {{ subtitle }}
    .ni-li-icon
      i.material-icons.inactive chevron_right
      i.material-icons.active my_location
  router-link.ni-li(v-else-if='dt && to' :to="to"): .ni-li-container
    .ni-li-thumb
      template(v-if='icon'): i.material-icons {{ icon }}
      template(v-else-if='image'): img(:src='image')
      template(v-else-if="$slots['graphic']"): slot(name='graphic')
    .ni-li-dl
      .ni-li-dt {{ dt }}
      .ni-li-dd.ni-li-dd-flush(v-if="$slots['dd']"): slot(name='dd')
      .ni-li-dd(v-else) {{ dd }}
    .ni-li-icon
      i.material-icons.inactive chevron_right
      i.material-icons.active my_location
  .ni-li(v-else-if='dt'): .ni-li-container
    .ni-li-thumb
      template(v-if='icon'): i.material-icons {{ icon }}
      template(v-else-if='image'): img(:src='image')
      template(v-else-if="$slots['graphic']"): slot(name='graphic')
    .ni-li-dl
      .ni-li-dt {{ dt }}
      .ni-li-dd.ni-li-dd-flush(v-if="$slots['dd']"): slot(name='dd')
      .ni-li-dd(v-else) {{ dd }}
  .ni-li(v-else-if="type === 'image'"): .ni-li-container: slot
  router-link.ni-li(v-else :to='to'): .ni-li-container
    .ni-li-thumb
      template(v-if='icon'): i.material-icons {{ icon }}
      template(v-else-if='image'): img(:src='image')
      template(v-else-if="$slots['graphic']"): slot(name='graphic')
    .ni-li-label
      .ni-li-title {{ title }}
      .ni-li-subtitle {{ subtitle }}
    .ni-li-icon
      i.material-icons.inactive chevron_right
      i.material-icons.active my_location
</template>

<script>
export default {
  name: 'ni-list-item',
  props: ['type', 'title', 'subtitle', 'image', 'icon', 'to', 'dt', 'dd']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-li
  display block
  border-bottom 1px solid bc-dim
  height 3rem
  max-width width-main

  &.router-link-exact-active
    .ni-li-title
      color accent1
    .ni-li-icon
      i.material-icons
        color accent1
      .inactive
        display none
      .active
        display block

.ni-li-container
  display flex
  flex-flow row nowrap
  align-items center
  position relative

// type: anchor & link

.ni-li-thumb
.ni-li-label
.ni-li-icon
  height 3rem - px

.ni-li-thumb:empty
  display none

.ni-li-thumb
  width 3rem - px
  i.material-icons
    display block
    background bc-faint
    width 3rem - px
    height 3rem - px
    display flex
    align-items center
    justify-content center
    color txt

.ni-li-label
  flex 1
  display flex
  align-items flex-start
  justify-content center
  padding 0 1rem
  flex-flow column nowrap
  .ni-li-title
    color txt
    line-height 1.25
  .ni-li-subtitle
    color dim
    font-size 0.66666rem
    line-height 1.25

// type: dl definition list

.ni-li-dl
  flex 1
  height 3rem - px
  padding 0 0.5rem

  display flex
  align-items center

  // truncate
  min-width 0

.ni-li-dt
.ni-li-dd
  // truncate
  white-space nowrap
  text-overflow ellipsis
  overflow hidden

.ni-li-dt
  padding-left 0.5rem
  padding-right 0.25rem

  max-width width-side
  flex 2
  color txt
  font-size 0.75rem
  line-height 1rem
  font-weight bold

.ni-li-dd
  padding-left 0.25rem
  padding-right 0.5rem

  flex 3
  color txt
  line-height 1.25

  // add some flair
  height 3rem - px - 0.75rem
  display flex
  align-items center
  background alpha(app-fg, 7.5%)

  &.ni-li-dd-flush
    padding 0
  &.ni-li-dd-flush > div
    display flex
    height 3rem - px

a.ni-li-dd
  color accent1
  cursor pointer

.ni-li-icon
  width 1.5rem
  display flex
  align-items center
  position absolute
  top 0
  right 0
  .inactive
    display block
  .active
    display none
</style>
