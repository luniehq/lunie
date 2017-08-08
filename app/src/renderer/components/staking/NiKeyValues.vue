<template>
  <div :class="cssClass">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ni-kvs',
  computed: {
    cssClass () {
      let value = 'ni-kvs'
      if (this.size) value += ` ni-kvs-size-${this.size}`
      return value
    }
  },
  props: ['size']
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.ni-kvs
  margin 1rem 0
  
  display flex
  flex-flow column nowrap

  border 2px solid bc-dim
  border-radius 0.25rem

@media screen and (min-width: 768px)
  .ni-kvs.ni-kvs-size-lg
    border none
    flex-flow row wrap
    padding 0.5rem
    margin -0.5rem -1rem

    .ni-kv.ni-kv-size-lg
      flex 0 0 33.3333%
      .ni-kv-container
        margin 0.5rem
</style>
