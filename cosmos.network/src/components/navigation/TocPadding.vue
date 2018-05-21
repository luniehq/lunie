<template>
  <div class="toc-padding">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "toc-padding"
}
</script>

<style lang="stylus">
@import '~variables'

@media screen and (min-width: 1024px)
  .toc-padding.toc-visible
    margin-left width-side
</style>
