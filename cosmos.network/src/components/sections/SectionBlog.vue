<template lang='pug'>
.section-home: .section-home__container
  .section-home__header Latest from #[a(href="https://blog.cosmos.network" target="_blank") the Blog]
  .section-home__main
    .blog-posts
      a.blog-post(v-for="p in posts" :href="p.link" target="_blank"): .blog-post-container
        img.blog-post__image(:src="imageSrc(p['content:encoded'])")
        .blog-post__text
          .blog-post__title {{ p.title }}
          .blog-post__date {{ humanDate(p.isoDate) }}
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
export default {
  name: "section-blog",
  computed: {
    posts() {
      return this.blog.posts.slice(0, 9)
    },
    ...mapGetters(["blog"])
  },
  methods: {
    imageSrc(txt) {
      let el = document.createElement("html")
      el.innerHTML = txt
      let src = el.querySelectorAll("img")[0].src
      return src
    },
    humanDate(date) {
      return moment(date).format("MMMM D, YYYY")
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

a.blog-post
  margin-bottom 1rem
  display flex
  &:last-child
    margin-bottom 0
  &:hover
    .blog-post__text
      background hover
    .blog-post__date
      color txt

.blog-post-container
  flex 1
  display flex
  flex-flow column nowrap

.blog-post__image
  display block
  width 100%

.blog-post__text
  padding 1rem
  flex 1
  background app-fg

.blog-post__title
  font-size lg
  line-height 1.25
  margin-bottom 0.5rem
  color bright

.blog-post__date
  color dim

@media screen and (min-width:768px)
  .blog-posts
    display flex
    flex-flow row wrap
    margin 0 -0.5rem -0.5rem

  a.blog-post
    flex 0 0 50%
    margin 0

  .blog-post-container
    margin 0.5rem

@media screen and (min-width: 1024px)
  .blog-posts
    margin-left -1.5rem
    margin-right -1.5rem

  a.blog-post
    flex 0 0 33.3333%
</style>
