<template lang="pug">
.ni-data-msg
  .ni-data-msg__icon: i.material-icons(:class="iconCssClass") {{ icon }}
  .ni-data-msg__text
    .ni-data-msg__title: slot(name="title") {{ title }}
    .ni-data-msg__subtitle: slot(name="subtitle") {{ subtitle }}
</template>

<script>
export default {
  name: 'ni-data-msg',
  computed: {
    iconCssClass () {
      if (this.spin) {
        return 'fa-spin'
      }
    }
  },
  props: ['title', 'subtitle', 'icon', 'spin']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-data-msg
  background app-fg
  padding 1rem
  
.ni-data-msg__icon
  margin-bottom 0.5rem
  i.material-icons
    font-size 3rem
    color txt

.ni-data-msg__text
  max-width 30rem

.ni-data-msg__title
  color bright
  font-size h2

.ni-data-msg__subtitle
  color dim

@media screen and (min-width: 768px)
  .ni-data-msg
    display flex
    padding 3rem

  .ni-data-msg__icon
    margin-bottom 0
    margin-right 1.5rem
    i.material-icons
      font-size 4rem
</style>
