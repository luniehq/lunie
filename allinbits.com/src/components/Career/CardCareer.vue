<template>
  <router-link :class="cssClass" :to="url">
    <div class="title">{{ career.title }}</div>
  </router-link>
</template>

<script>
export default {
  name: 'card-career',
  computed: {
    url () {
      return '/careers/' + this.career.slug
    },
    cssClass () {
      let value = 'card-career'
      if (this.theme === 'dark') value += ' card-career-dark'
      return value
    }
  },
  props: ['career', 'theme']
}
</script>

<style lang="stylus">
@require '~variables'

.card-career + .card-career
  border-top none

.card-career
  display block

  color txt
  border 1px solid bc
  padding 0.5em

  .locations
    display flex

  .location
    font-size 0.75rem
    color dim
    &:not(:last-of-type):after
      content '/'
      display inline-block
      padding 0 0.5rem 0 0.25rem
      color light

  &:hover
    .title
      color link

  &.card-career-dark
    border-color lighten(mcolor, 10%)
    .location
      color lighten(mcolor, 50%)
      &:after
        color lighten(mcolor, 20%)
    &:hover
      background lighten(mcolor, 3%)

@media screen and (min-width: 768px)
  .card-career
    display flex
    align-items center
    padding 0.5em 1em
    .title, .locations
      flex 1
</style>
