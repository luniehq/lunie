<template lang="pug">
.page-career-entry
  page-header(:title='career.title' :subtitle='subtitle')
  article-body
    div(v-html="markdown(career.body)")
    btn(
      type='anchor'
      size='lg'
      href='mailto:careers@tendermint.com'
      icon='envelope-o'
      value='Send Application')
</template>

<script>
import PageHeader from '@nylira/vue-page-header'
import ArticleBody from '@nylira/vue-article-body'
import { mapGetters } from 'vuex'
import MarkdownIt from 'markdown-it'
import Btn from '@nylira/vue-button'
export default {
  name: 'page-career-entry',
  components: {
    Btn,
    PageHeader,
    ArticleBody
  },
  computed: {
    ...mapGetters(['allCareers']),
    career () {
      if (this.allCareers) {
        return this.allCareers.find(c => c.slug === this.$route.params.entry)
      }
      return { title: 'Loading...', subtitle: 'Loading...' }
    },
    subtitle () {
      return this.capitalize(this.career.area) + ' Position at All In Bits'
    }
  },
  methods: {
    capitalize (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    markdown (text) {
      let md = new MarkdownIt()
      return md.render(text)
    },
    email (address) {
      window.location.href = 'mailto:' + address
    }
  },
  mounted () {
    document.title = this.career.title + ' - Careers - All In Bits'
  }
}
</script>


<style lang="stylus">
@require '~variables'

.page-career-entry
  .tags
    margin-top 1.5*x
    text-align center
    max-width 40*x
    display flex
    flex-flow row wrap
    justify-content center

  .tag
    font-size 0.75*x
    background lighten(bc, 50%)
    color dim
    margin-right 0.25*x
    margin-bottom 0.25*x
    padding 0.25*x 0.5*x

    cursor pointer

    background hsla(0,0,0,25%)
    color #fff
    &.active
      background darken(acolor,25%)

  .ni-btn-wrapper
    width 18rem
    margin-bottom 1.5rem
  .article-body
    li
      p
        margin 0

@media screen and (min-width: 768px)
  .page-career-entry
    .tags
      margin-top 2*x

    .tag
      font-size x
</style>
