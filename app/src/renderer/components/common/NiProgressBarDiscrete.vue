<template lang='pug'>
.ni-progress-bar-discrete
  .ni-progress-bar-discrete__segment(v-for="s in segments")
</template>

<script>
export default {
  name: "ni-progress-bar-discrete",
  props: ["segments", "activeSegment"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-progress-bar-discrete
  height 2rem
  display flex
  align-items center
  justify-content space-between

.ni-progress-bar-discrete__segment
  width 0.5rem
  height 0.5rem
  background var(--accent)
  border-radius 0.5rem
</style>
