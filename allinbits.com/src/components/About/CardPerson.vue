<template>
  <div class="person-wrapper">
    <div class="card-person" @click="setPopup(true)">
      <div class="avatar">
        <img :src="portrait(person.slug)">
        <i class="fa fa-search"></i>
      </div>
      <div class="text">
        <div class="name">{{ person.name }}</div>
        <div class="title">{{ person.groups[group] }}</div>
      </div>
    </div>
    <modal-person
      :group="group"
      :person="person"
      v-if="activePopup"
      @click.native="setPopup(false)">
    </modal-person>
  </div>
</template>

<script>
import { portrait } from '../../scripts/cdn.js'
import ModalPerson from './ModalPerson'
export default {
  name: 'card-person',
  components: {
    ModalPerson
  },
  data: () => ({
    activePopup: false,
    portrait: portrait
  }),
  methods: {
    setPopup (state) {
      this.activePopup = state
    }
  },
  props: ['person', 'group']
}
</script>

<style scoped lang="stylus">
@import '~@/styles/variables.styl'

.card-person
  padding 0.5rem
  display flex
  align-items center
  cursor pointer

  .avatar
    display block
    margin-right 1rem
    position relative
    img
      width 3rem
      border-radius 2.5rem
    i.fa
      background alpha(c-app-fg, 80%)
      border-radius 1rem
      width 1.25rem
      height 1.25rem

      display flex
      align-items center
      justify-content center

      color mcolor
      font-size 0.66rem

      position absolute
      bottom 0
      right 0

  .name
    font-weight 400

  .title
    color light
    font-size 0.875rem

  &:hover
    background alpha(mcolor, 5%)
    .avatar i.fa
      background link
      color c-app-fg

@media screen and (min-width:360px)
  .card-person
    .avatar img
      width 3.5rem

    .title
      font-size 1rem

@media screen and (min-width:400px)
  .card-person
    .avatar img
      width 4rem
    .name
      font-weight 500
</style>
