<template>
  <router-link :class="cssClass" :to="url">
    <div class="title">{{ career.title }}</div>
  </router-link>
</template>

<script>
export default {
  name: "card-career",
  computed: {
    url() {
      return "/careers/" + this.career.slug
    },
    cssClass() {
      let value = "card-career"
      return value
    }
  },
  props: ["career", "theme"]
}
</script>

<style lang="stylus">
@require '~variables'

.card-career + .card-career
  border-top none

.card-career
  display block
  color var(--txt)
  border 1px solid var(--bc)
  padding 0.5em

  .locations
    display flex

  .location
    font-size 0.75rem
    color var(--dim)
    &:not(:last-of-type):after
      content '/'
      display inline-block
      padding 0 0.5rem 0 0.25rem
      color var(--light)

  &:hover
    .title
      color var(--link)

@media screen and (min-width: 768px)
  .card-career
    display flex
    align-items center
    padding 0.5em 1em
    .title, .locations
      flex 1
</style>
