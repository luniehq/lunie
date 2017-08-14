<template>
  <div class="card-empty">
    {{ value }}
  </div>
</template>

<script>
export default {
  props: ['value']
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.card-empty
  font-size 0.75rem
  background app-fg
  min-height 3em
  display flex
  justify-content center
  align-items center
  color light

@media screen and (min-width: 400px)
  .card-empty
    font-size 0.875rem

@media screen and (min-width: 640px)
  .card-empty
    font-size 1rem
</style>
