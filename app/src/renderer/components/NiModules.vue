<template>
  <div class="ni-modules">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ni-modules'
}
</script>

<style lang="stylus">
.ni-modules
  display flex
  flex-flow column nowrap

@media screen and (min-width: 768px)
  .ni-modules
    display flex
    flex-flow row wrap

    .ni-module
      flex 1 1 100%
      &.ni-module-sm
        flex 1 1 50%
</style>
