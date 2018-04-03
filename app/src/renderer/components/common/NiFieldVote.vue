<template lang="pug">
.ni-field-vote: .ni-field-vote-container
  .ni-field-vote-input
    i.material-icons(v-if="active") radio_button_checked
    i.material-icons(v-else) radio_button_unchecked
  .ni-field-vote-label
    .ni-field-vote-bar-outer(v-if="results")
      .ni-field-vote-bar-inner(:style='innerBarStyle')
    .ni-field-vote-dl
      .ni-field-vote-dt {{ dt }}
      .ni-field-vote-dd(v-if="results") {{ Math.round(dd * 100) + '%' }}
</template>

<script>
export default {
  name: 'ni-list-item',
  computed: {
    innerBarStyle () {
      return {
        width: Math.round(this.dd * 100) + '%',
        background: this.color
      }
    }
  },
  methods: {
    updateValue (value) {
      let formattedValue = value.trim()
      // Emit the number value through the input event
      this.$emit('input', formattedValue)
    }
  },
  props: ['dt', 'dd', 'color', 'active', 'results']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-field-vote-container
  height 3rem
  border-bottom px solid var(--bc)
  display flex
  position relative

.ni-field-vote-input
.ni-field-vote-dl
.ni-field-vote-bar-outer
.ni-field-vote-bar-inner
  height 3rem - px

.ni-field-vote-input
  width 3rem
  display flex
  align-items center
  justify-content center
  i.material-icons
    width 3rem
    text-align center

.ni-field-vote-label
  flex 1
  position relative
  border-left px solid var(--bc)

.ni-field-vote-dl
  position relative
  z-index z(default)

  padding 0 1rem

  display flex
  align-items center
  justify-content space-between

  color var(--bright)

.ni-field-vote-bar-outer
  position absolute
  z-index z(zero)

  width 100%
  top 0
  left 0
</style>
