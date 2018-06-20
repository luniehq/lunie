<template lang="pug">
.tm-field-vote: .tm-field-vote-container
  .tm-field-vote-input
    i.material-icons(v-if="active") radio_button_checked
    i.material-icons(v-else) radio_button_unchecked
  .tm-field-vote-label
    .tm-field-vote-bar-outer(v-if="results")
      .tm-field-vote-bar-inner(:style='innerBarStyle')
    .tm-field-vote-dl
      .tm-field-vote-dt {{ dt }}
      .tm-field-vote-dd(v-if="results") {{ Math.round(dd * 100) + '%' }}
</template>

<script>
export default {
  name: "tm-list-item",
  computed: {
    innerBarStyle() {
      return {
        width: Math.round(this.dd * 100) + "%",
        background: this.color
      }
    }
  },
  methods: {
    updateValue(value) {
      let formattedValue = value.trim()
      // Emit the number value through the input event
      this.$emit("input", formattedValue)
    }
  },
  props: ["dt", "dd", "color", "active", "results"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-field-vote-container
  height 3rem
  border-bottom px solid var(--bc)
  display flex
  position relative

.tm-field-vote-input
.tm-field-vote-dl
.tm-field-vote-bar-outer
.tm-field-vote-bar-inner
  height 3rem - px

.tm-field-vote-input
  width 3rem
  display flex
  align-items center
  justify-content center
  i.material-icons
    width 3rem
    text-align center

.tm-field-vote-label
  flex 1
  position relative
  border-left px solid var(--bc)

.tm-field-vote-dl
  position relative
  z-index z(default)

  padding 0 1rem

  display flex
  align-items center
  justify-content space-between

  color var(--bright)

.tm-field-vote-bar-outer
  position absolute
  z-index z(zero)

  width 100%
  top 0
  left 0
</style>
