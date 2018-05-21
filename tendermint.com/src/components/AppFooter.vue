<template lang='pug'>
.app-bottom
  section-bottom
  footer.app-footer
    .sections
      section
        span &copy; {{ new Date().getFullYear() }} All In Bits, Inc.
      section
        header Company
        router-link(to="/about") About
        router-link(to="/careers") Careers
        router-link(to="/privacy") Privacy
        a(:href='links.tm.blog' target='_blank') Blog
        a(:href='links.tm.twitter') @tendermint_team
      section
        header Developers
        router-link(to="/downloads") Downloads
        router-link(to="/ecosystem") Ecosystem
        a(:href='links.tm.docs.index' target='_blank') Documentation
        a(:href='links.tm.github.source' target='_blank')  Source Code
        a(:href='links.tm.github.issues' target='_blank') Issues
      section
        header Cosmos
        a(href='https://cosmos.network' target="_blank") Cosmos Network
        a(:href='links.cosmos.community.matrix' target="_blank") Developer Chat
        a(:href='links.cosmos.community.telegram' target="_blank") Community Chat
        a(:href='links.cosmos.reddit' target="_blank") /r/cosmosnetwork
        a(:href='links.cosmos.twitter' target="_blank") @cosmos
</template>

<script>
import SectionBottom from "comp/SectionBottom"
import { mapGetters } from "vuex"
export default {
  name: "app-footer",
  computed: { ...mapGetters(["links"]) },
  components: {
    SectionBottom
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-footer
  .footer-logo
    width 80px
    height 80px

  .sections
    padding x 0
    color var(--app-fg)
    margin 0 auto

    display flex
    flex-flow row wrap

  section
    flex 0 0 50%
    padding x 0.5*x

    header
      padding 0.25*x 0.5*x
      color var(--dim)
      font-size 0.75*x
      text-transform uppercase
      letter-spacing 0.0625em
      font-weight 500

    a, span
      color var(--txt)
      display block
      padding 0.25*x 0.5*x

      i.fa
        display inline-block
        text-align center
        width 1.5*x
        margin-right 0.5*x
    a
      &:hover
        color var(--link)

@media screen and (min-width: 360px)
  .app-footer
    .sections
      padding x x*0.5
    .section
      padding x

@media screen and (min-width: 414px)
  .app-footer
    .sections
      padding x

@media screen and (min-width: 768px)
  .app-footer
    .sections
      padding 2*x
    section
      flex 0 0 25%
      header
        margin-bottom x

@media screen and (min-width: 1024px)
  .app-footer
    .sections
      max-width 1024px
    section
      flex 0 0 25%

@media screen and (min-width: 1280px)
  .app-footer
    .sections
      max-width 100vw
      padding-left 3rem
      padding-right 3rem
    section
      flex 0 0 25%
</style>
