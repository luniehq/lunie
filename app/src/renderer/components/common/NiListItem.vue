<template lang="pug">
mixin ni-li-thumb
  .ni-li-thumb
    template(v-if='icon'): i.material-icons {{ icon }}
    template(v-else-if='image'): img(:src='image')
    template(v-else-if="$slots['graphic']"): slot(name='graphic')
mixin ni-li-dl
  .ni-li-dl
    .ni-li-dt {{ dt }}
    .ni-li-dd.ni-li-dd-flush(v-if="$slots['dd']"): slot(name='dd')
    .ni-li-dd(v-else) {{ dd }}
mixin ni-li-icon
  .ni-li-icon
    i.material-icons.inactive chevron_right
    i.material-icons.active my_location
mixin ni-li-label
  .ni-li-label
    .ni-li-title {{ title }}
    .ni-li-subtitle {{ subtitle }}
transition(name="proposal")
  // dt/dd anchor
  a.ni-li.ni-li-link(v-if='dt && href' :href="href"): .ni-li-container
    +ni-li-thumb
    +ni-li-dl
    +ni-li-icon

  // dt/dd router-link
  router-link.ni-li.ni-li-link(v-else-if="dt && to && !btn" :to="to"): .ni-li-container
    +ni-li-thumb
    +ni-li-dl
    +ni-li-icon

  // button router-link
  router-link.ni-li.ni-li-link(v-else-if="btn && to" :to="to"): .ni-li-container
    +ni-li-thumb
    +ni-li-dl
    btn(:value="btn" icon="chevron_right" icon-pos="right").btn__primary

  // dt/dd text
  .ni-li(v-else-if='dt'): .ni-li-container
    +ni-li-thumb
    +ni-li-dl

  // title/subtitle anchor
  a.ni-li.ni-li-link(v-else-if="href" :href="href"): .ni-li-container
    +ni-li-thumb
    +ni-li-label
    +ni-li-icon

  // title/subtitle router-link
  router-link.ni-li.ni-li-link(v-else-if="to" :to='to'): .ni-li-container
    +ni-li-thumb
    +ni-li-label
    +ni-li-icon

  // title/subtitle text
  .ni-li(v-else-if='title'): .ni-li-container
    +ni-li-thumb
    +ni-li-label

  // image
  .ni-li(v-else-if="type === 'image'"): .ni-li-container: slot
</template>

<script>
import Btn from '@nylira/vue-button'
export default {
  name: 'ni-list-item',
  props: ['type', 'title', 'subtitle', 'image', 'icon', 'to', 'dt', 'dd', 'href', 'btn'],
  components: {
    Btn
  },
}

</script>

<style lang="stylus">
@require '~variables'

.ni-li
  display block
  border-bottom 2px solid bc-dim
  height 3rem
  position relative

  &:last-child
    border-bottom: none

  &:first-child
    height 3rem + px

  &.ni-li-link
    &:hover
      background: app-bg-hover

      .ni-li-label
        cursor pointer

      .ni-li-title
        color bright

    &:before
      content ''
      display block
      position absolute
      top 0
      left 0
      height 3rem
      width bw
      background transparent
      z-index z(listItem)

    .ni-li-dt
    .ni-li-dd
      color link

  &.router-link-exact-active
    .ni-li-title
      color bright
    &:before
      background mc

    .ni-li-icon
      i.material-icons
        color mc
  .ni-btn
    padding 0 0.75em

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
  padding 0 1rem 0 0
  flex-flow column nowrap

  .ni-li-title
    color txt
    line-height 1.25
  .ni-li-subtitle
    color dim
    font-size xs
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
  color txt

.ni-li-dt
  padding-left 0.5rem
  padding-right 0.25rem

  max-width width-side
  flex 2

.ni-li-dd
  padding-left 0.25rem
  padding-right 0.5rem

  flex 3
  line-height 1.25

  &.ni-li-dd-flush
    padding 0
  &.ni-li-dd-flush > div
    display flex
    height 3rem - px

a.ni-li-dd
  color mc
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
