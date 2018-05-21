<template>
  <div class="modal-wrapper">
    <div class="modal-person">
      <img class="avatar" :src="portrait(person.slug)">
      <div class="text">
        <div class="name">{{ person.name }}</div>
        <div class="title">{{ person.groups[group] }}</div>
        <div class="bio">{{ person.bio }}</div>
      </div>
      <div class="links">
        <a v-if="person.ids.email"
          :href="'mailto:' + person.ids.email + '@tendermint.com'" target="_blank">
          <i class="fa fa-envelope"></i>
          <span class="label">{{ person.ids.email }}@tendermint.com</span>
        </a>
        <a v-if="person.ids.github" :href="'https://github.com/' + person.ids.github" target="_blank">
          <i class="fa fa-github-alt"></i>
          <span class="label">github.com/{{ person.ids.github }}</span>
        </a>
        <a v-if="person.ids.keybase" :href="'https://keybase.io/' + person.ids.keybase" target="_blank">
          <i class="fa fa-key"></i>
          <span class="label">keybase.io/{{ person.ids.keybase }}</span>
        </a>
        <a v-if="person.ids.linkedin" :href="'https://www.linkedin.com/in/' + person.ids.linkedin" target="_blank">
          <i class="fa fa-linkedout"></i>
          <span class="label">{{ person.name }}</span>
        </a>
        <a v-if="person.ids.twitter" :href="'https://twitter.com/' + person.ids.twitter" target="_blank">
          <i class="fa fa-twatter"></i>
          <span class="label">@{{ person.ids.twitter }}</span>
        </a>
        <a v-if="person.ids.website" :href="'http://' + person.ids.website" target="_blank">
          <i class="fa fa-globe"></i>
          <span class="label">{{ person.ids.website }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import disableScroll from 'disable-scroll'
import CardPerson from './CardPerson'
import { portrait } from '../../scripts/cdn.js'
export default {
  name: 'section-people',
  components: {
    CardPerson
  },
  data: () => ({
    portrait: portrait
  }),
  mounted () {
    disableScroll.on()
  },
  beforeDestroy () {
    disableScroll.off()
  },
  props: ['person', 'group']
}
</script>

<style scoped lang="stylus">
@import '~@/styles/variables.styl'

.modal-wrapper
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  z-index 100

  display flex
  align-items center
  justify-content center

  background hsla(0,0,0,0.1)
  backdrop-filter blur(0.5rem)

.modal-person
  max-width 360px
  width 100%
  background c-app-fg
  box-shadow hsla(0,0,0,0.25) 0 0.25rem 0.5rem
  border-radius 0.5rem
  margin 0 0.5rem

  display flex
  align-items center
  flex-flow column
  position relative
  &:before
    display block
    position absolute
    top 0
    right 0

    width 3rem
    height 3rem
    display flex
    align-items center
    justify-content center

    content '\f057'
    font-family FontAwesome
    color bc
    font-size 1.25rem

  .avatar
    display block
    width 8rem
    margin 2rem 2rem 0
    border-radius 10rem

  .text
    text-align center
    padding 1rem 1.5rem 1.25rem

  .name
    font-weight bold
    font-size 1.25rem

  .title
    color light
    font-size 0.75rem
    margin-bottom 0.75rem

  .bio
    font-size 0.75rem
    text-align left

  .links
    border-top 1px dotted bc
    width 100%
    height 3rem

    display flex
    justify-content center
    a
      flex 1
      border-right 1px dotted bc

      display flex
      align-items center
      justify-content center

      color light
      &:last-of-type
        border-right none
      &:hover
        color mcolor

      .label
        display none

@media screen and (min-width: 360px)
  .modal-person
    margin 0 0.75rem
    .avatar
      width 9rem

    .name
      font-size 1.375rem

    .title, .bio
      font-size 0.875rem

@media screen and (min-width: 400px)
  .modal-person
    .avatar
      width 10rem

    .name
      font-size 1.5rem

    .title
      margin-bottom 1.25rem

    .title, .bio
      font-size 1rem
    .links a
      flex 0 0 60px
</style>
