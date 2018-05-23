<template lang="pug">
.card-post
  template(v-if="url.substr(0,4) === 'http'")
    a(:href='url')
      .title {{ title }}
      .meta {{ meta }}
      .desc {{ desc }}
  template(v-else='')
    router-link(:to='url')
      .title {{ title }}
      .meta {{ meta }}
      .desc {{ desc }}
</template>

<script>
export default {
  name: "card-post",
  props: ["title", "desc", "meta", "url"]
}
</script>


<style lang="stylus">
@require '~variables'

.card-post
  margin-bottom 1rem

  a
    border 1px solid var(--bc)
    padding 1rem
    display block
    color var(--txt)
    &:hover
      text-decoration none
    &:hover .title
      color var(--link)

  &:last-of-type
    margin-bottom 0

  .title
    font-weight 500
    line-height 1.25
    color var(--txt)

  .title, .meta
    margin-bottom 0.25rem

  .meta
    line-height 2
    color var(--light)

  .desc
    max-width 40em
    color var(--light)

@media screen and (min-width: 360px)
  .card-post
    .title
      font-size 1.125em

@media screen and (min-width: 768px)
  .card-post
    .title
      font-size 1.25*x
    a
      padding 1.5rem
</style>
