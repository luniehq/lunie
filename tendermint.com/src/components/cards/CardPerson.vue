<template lang="pug">
.ni-card-person
  .person-container(@click='setPopup(true)')
    .avatar
      img(:src='portrait(person.slug)')
      i.material-icons search
    .text
      .name {{ person.name }}
      .title {{ person.groups[group] }}
  modal-person(:group='group', :person='person', v-if='activePopup', @click.native='setPopup(false)')
</template>

<script>
import ModalPerson from "modals/ModalPerson"
import { portrait } from "scripts/cdn"
export default {
  name: "ni-card-person",
  components: {
    ModalPerson
  },
  data: () => ({
    activePopup: false,
    portrait: portrait
  }),
  methods: {
    setPopup(state) {
      this.activePopup = state
    }
  },
  props: ["person", "group"]
}
</script>

<style scoped lang="stylus">
@import '~variables'

.person-container
  background var(--app-bg)
  padding 0.5rem
  display flex
  align-items center
  cursor pointer
  margin 0.125rem

  .avatar
    display block
    margin-right 1rem
    position relative
    img
      width 3rem
      height 3rem
      border-radius 2.5rem
    i.material-icons
      background var(--app-fg)
      border-radius 1rem
      width 1rem
      height 1rem

      display flex
      align-items center
      justify-content center

      color var(--txt)

      position absolute
      bottom 0.25rem
      right 0.25rem
      font-size sm

  .name
    font-weight 500
  .title
    color var(--dim)
    font-size 0.875*x

  &:hover
    background var(--app-fg)
    .avatar
      i.material-icons
        color var(--hover)
    .name
      color var(--bright)

@media screen and (min-width:360px)
  .person-container
    .avatar img
      width 3.5rem
      height 3.5rem

@media screen and (min-width:400px)
  .person-container
    .avatar img
      width 4rem
      height 4rem

@media screen and (min-width:768px)
  .person-container
    padding 1rem
</style>
