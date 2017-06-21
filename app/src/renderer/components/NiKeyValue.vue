<template>
  <div :class="cssClass">
    <div class="ni-kv-container">
      <div class="ni-kv-content">
        <div class="ni-kv-key"><slot name="key"></slot></div>
        <div class="ni-kv-value"><slot name="value"></slot></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ni-kv',
  computed: {
    cssClass () {
      let value = 'ni-kv'
      if (this.size) value += ` ni-kv-size-${this.size}`
      return value
    }
  },
  props: ['size']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-kv
  border-bottom 1px solid bc-faint
  height 2rem
  &:first-of-type
    height 2rem - 2*px
  &:last-of-type
    height 2rem - 2*px
  &:last-of-type
    border-bottom-color transparent

.ni-kv-content
  display flex

.ni-kv-key
.ni-kv-value
  height 2rem - 2*px
  padding 0 1rem - 2*px

  display flex
  align-items center

  // fix for longer strings
  min-width 0

  > div
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

.ni-kv-key
  flex 1

  > div
    font-label()
    color dim
    font-size 0.666rem
    letter-spacing 0.025em

.ni-kv-value
  flex 2
  text-transform none
  
  > div, > a
    color bright

  > a, > div a
    color link
    &:hover
      color hover

@media screen and (min-width: 768px)
  .ni-kv-value
    flex 3

@media screen and (min-width: 768px)
  .ni-kv.ni-kv-size-lg
    height auto
    border-bottom none
    position relative
    &:before
      content ''
      width 1.5rem
      height px
      background bc-dim
      position absolute
      top 2.25rem + 2*px + px
      right 0.5rem + 2*px
      border-left 0.25rem solid bc

    .ni-kv-container
      height auto

      padding 1rem - 2*px 0
      border 2px solid bc-dim
      border-radius 0.25rem
      display flex
    
    .ni-kv-content
      flex 1
      display block

    .ni-kv-key
    .ni-kv-value
      height auto
      font-size 0.75rem
      padding-left 1rem - 2*px
      padding-right 1rem - 2*px

    .ni-kv-key
      border-bottom 1px solid bc-faint
      display flex
      align-items center
      height 2rem

    .ni-kv-value
      > div
        font-size 1.75rem
        line-height 3rem
</style>
