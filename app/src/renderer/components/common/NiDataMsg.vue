<template lang="pug">
.ni-data-msg
  .icon: i.material-icons(:class="iconCssClass") {{ icon }}
  .text
    .title: slot(name="title") {{ title }}
    .subtitle: slot(name="subtitle") {{ subtitle }}
</template>

<script>
export default {
  name: 'ni-data-msg',
  computed: {
    iconCssClass () {
      if (this.spin) { return 'fa-spin' }
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
  .icon
    margin-bottom 0.5rem
    i.material-icons
      font-size 3rem
      color txt
  .text
    max-width 40rem
    .title
      color bright
      font-size h2
    .subtitle
      color dim

@media screen and (min-width: 768px)
  .ni-data-msg
    display flex
    padding 3rem
    .icon
      margin-bottom 0
      margin-right 1.5rem
      i.material-icons
        font-size 4rem
</style>
