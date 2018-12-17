<template lang="pug">
.tm-data-msg
  .tm-data-msg__icon: i.material-icons(:class="iconCssClass") {{ icon }}
  .tm-data-msg__text
    .tm-data-msg__title: slot(name="title") {{ title }}
    .tm-data-msg__subtitle: slot(name="subtitle") {{ subtitle }}
</template>

<script>
export default {
  name: "tm-data-msg",
  computed: {
    iconCssClass() {
      if (this.spin) {
        return "fa-spin"
      }
    }
  },
  props: ["title", "subtitle", "icon", "spin"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-data-msg
  background var(--app-fg)
  padding 1rem

.tm-data-msg__icon
  margin-bottom 0.5rem
  i.material-icons
    font-size 3rem
    color var(--txt)

.tm-data-msg__text
  max-width 30rem

.tm-data-msg__title
  color var(--bright)
  font-size h2

.tm-data-msg__subtitle
  color var(--dim)

@media screen and (min-width: 768px)
  .tm-data-msg
    display flex
    padding 3rem

  .tm-data-msg__icon
    margin-bottom 0
    margin-right 1.5rem
    i.material-icons
      font-size 4rem
</style>
