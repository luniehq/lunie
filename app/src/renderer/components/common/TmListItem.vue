<template lang="pug">
mixin tm-li-thumb
  .tm-li-thumb
    template(v-if='icon'): i.material-icons(:class="spinClass") {{ icon }}
    template(v-else-if='image'): img(:src='image')
    template(v-else-if="$slots['graphic']"): slot(name='graphic')
mixin tm-li-dl
  .tm-li-dl
    .tm-li-dt {{ dt }}
    .tm-li-dd.tm-li-dd-flush(v-if="$slots['dd']"): slot(name='dd')
    .tm-li-dd(v-else) {{ dd }}
mixin tm-li-icon
  .tm-li-icon
    i.material-icons.inactive chevron_right
    i.material-icons.active my_location
mixin tm-li-label
  .tm-li-label
    .tm-li-title {{ title }}
    .tm-li-subtitle {{ subtitle }}
//- dt/dd anchor
a.tm-li.tm-li-link(v-if='dt && href' :href="href"): .tm-li-container
  +tm-li-thumb
  +tm-li-dl
  +tm-li-icon

//- label and input
.tm-li.tm-li-field(v-else-if="type === 'field'"): .tm-li-container
  +tm-li-thumb
  +tm-li-label
  .tm-li-input: slot

//- dt/dd router-link
router-link.tm-li.tm-li-link(v-else-if="dt && to && !btn" :to="to"): .tm-li-container
  +tm-li-thumb
  +tm-li-dl
  +tm-li-icon

//- button router-link
router-link.tm-li.tm-li-link(v-else-if="btn && to" :to="to"): .tm-li-container
  +tm-li-thumb
  +tm-li-dl
  tm-btn(:value="btn" icon="chevron_right" icon-pos="right" color="primary")

//- dt/dd text
.tm-li(v-else-if='dt'): .tm-li-container
  +tm-li-thumb
  +tm-li-dl

//- title/subtitle anchor
a.tm-li.tm-li-link(v-else-if="href" :href="href"): .tm-li-container
  +tm-li-thumb
  +tm-li-label
  +tm-li-icon

//- title/subtitle router-link
router-link.tm-li.tm-li-link(v-else-if="to" :to='to'): .tm-li-container
  +tm-li-thumb
  +tm-li-label
  +tm-li-icon

.tm-li.tm-li-receive(v-else-if="title && btn && !to"): .tm-li-container
  +tm-li-thumb
  +tm-li-label
  slot(name="btn-receive")

//- title/subtitle text
.tm-li(v-else-if='title'): .tm-li-container
  +tm-li-thumb
  +tm-li-label

//- image
.tm-li(v-else-if="type === 'image'"): .tm-li-container: slot
</template>

<script>
import TmBtn from "../TmBtn/TmBtn.vue"
export default {
  name: "tm-list-item",
  props: [
    "type",
    "title",
    "subtitle",
    "image",
    "icon",
    "to",
    "dt",
    "dd",
    "href",
    "btn",
    "spin",
    "overflow"
  ],
  components: { TmBtn },
  computed: {
    spinClass() {
      if (this.spin) {
        return "fa-spin"
      }
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li
  display block
  min-height 3rem
  position relative
  border-bottom 2*px solid var(--bc-dim)

  &:last-child
    border-bottom 2*px solid transparent

  &.tm-li-link
    &:hover, &.router-link-exact-active
      background var(--hover-bg)

      .tm-li-label
        cursor pointer

      .tm-li-title
        color var(--bright)

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

    .tm-li-dt
    .tm-li-dd
      color var(--link)

  &.router-link-exact-active
    .tm-li-title
      color var(--bright)
    &:before
      background var(--mc)

    .tm-li-icon
      i.material-icons
        color var(--mc)

.tm-li-label
.tm-li-dl
  .tm-btn
    position absolute
    top 0.5rem - px
    right 1rem

.tm-li-container
  display flex
  flex-flow row nowrap
  align-items center
  position relative
  min-height 3rem - 2*px
  max-width 60rem

// type: anchor & link
.tm-li-thumb
.tm-li-label
.tm-li-icon
  min-height 3rem - 2*px

.tm-li-thumb:empty
  display none

.tm-li-thumb
  width 3rem - px
  i.material-icons, img
    display block
    width 3rem - px
    height 3rem - px
  i.material-icons
    display flex
    align-items center
    justify-content center
    color var(--txt)

.tm-li-label
  flex 1
  display flex
  align-items flex-start
  justify-content center
  padding 0 1rem
  flex-flow column nowrap

  .tm-li-title
    color var(--txt)
    line-height 1.25
  .tm-li-subtitle
    color var(--dim)
    font-size xs
    line-height 1.25

.tm-li-link
  .tm-li-label
    //padding 0 1rem 0 0

// type: field

.tm-li-field .tm-li-container
  display flex
  .tm-li-label
    flex 2
  .tm-li-input
    flex 1
    display flex
    .tm-btn
      flex 1
    .tm-select
      width 100%

// type: dl definition list

.tm-li-dl
  flex 1
  height 3rem - px
  padding 0 0.5rem
  display flex
  align-items center

  // truncate
  min-width 0

.tm-li-dt
.tm-li-dd
  // truncate
  white-space nowrap
  text-overflow ellipsis
  overflow hidden
  color var(--txt)

.tm-li-dt
.tm-li-dd
  &:empty
    display none

.no-overflow
  .tm-li-dt
  .tm-li-dd
    overflow visible

.tm-li-dt
  padding-left 0.5rem
  padding-right 0.25rem

  max-width width-side
  flex 2

.tm-li-dd
  padding-left 0.25rem
  padding-right 0.5rem

  flex 3
  line-height 1.25

  &.tm-li-dd-flush
    padding 0
  &.tm-li-dd-flush > div
    display flex
    height 3rem - px

a.tm-li-dd
  color var(--mc)
  cursor pointer

.tm-li-icon
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
