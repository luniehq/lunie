<template lang="pug">
page.page-presentations-entry(:title="entry.title"
  :subtitle="'Published on ' + entry.date")
  text-container
    .youtube(:id='entry.id')
    presentations-footer(:facebook-url='facebookUrl', :twitter-url='twitterUrl')
</template>

<script>
import { mapGetters } from "vuex"
import $ from "jquery"
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import PresentationsFooter from "comp/PagePresentationsFooter"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-presentations-entry",
  metaInfo: {
    title() {
      return this.entry.title + " - Presentations"
    }
  },
  components: {
    Btn,
    Page,
    PresentationsFooter,
    TextContainer
  },
  computed: {
    entry() {
      let slug = this.$route.params.entry
      if (this.allPresentations) {
        return this.allPresentations.find(p => p.slug === slug)
      }
      return {}
    },
    facebookUrl() {
      let url = "https://www.facebook.com/sharer/sharer.php?u="
      if (this.entry) url += `${this.entry.title} ${window.location.href}`
      else url += ` ${window.location.href}`
      return url
    },
    twitterUrl() {
      let url = "https://twitter.com/home?status="
      if (this.entry) url += `${this.entry.title} ${window.location.href}`
      else url += ` ${window.location.href}`
      return url
    },
    ...mapGetters(["allPresentations"])
  },
  mounted() {
    let self = this

    $(".youtube").each(function() {
      // Set the BG image from the youtube ID
      $(this).css(
        "background-image",
        "url(//i.ytimg.com/vi/" + this.id + "/hqdefault.jpg)"
      )

      // Click the video div
      $(document).delegate("#" + this.id, "click", function() {
        // Build embed URL
        let iframeUrl =
          "//www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1"

        if (self.entry.start) {
          iframeUrl += "&start=" + self.entry.start
        }

        // Grab extra parameters set on div
        if ($(this).data("params")) {
          iframeUrl += "&" + $(this).data("params")
        }

        // Build iframe tag
        let iframe = $("<iframe/>", {
          allowfullscreen: "allowfullscreen",
          frameborder: "0",
          src: iframeUrl
        })

        // Replace the YouTube thumbnail with YouTube HTML5 Player
        $(this).append(iframe)
      })
    })
  }
}
</script>

<style lang="stylus">
@require '~variables'

.page-presentations-entry
  .youtube
    display block
    width 100vw
    height (100/16*9)vw
    max-width 48 * x // 768px
    max-height 27 * x // 432px
    margin-left -1*x
    margin-right -1*x

  div.youtube
    position relative
    cursor pointer
    background #000 no-repeat center center
    background-size cover
    clear both

  /* play bubble */
  div.youtube:before
    content ''
    background hsla(0,0,0,0.7)
    height 4*x
    width 6*x
    display block
    margin -2*x 0 0 -3*x
    border-radius x
    position absolute
    top 50%
    left 50%
    transition all 100ms ease
    z-index 1

  // play bubble hover
  div.youtube:hover:before
    background hsla(0,0,0,0.85)

  // Play Triangle 
  div.youtube:after
    display block
    position absolute
    top 50%
    left 50%
    z-index 2

    margin-left -1*x
    margin-top -1*x

    width 2*x
    line-height 2*x

    content '\f04b'
    font-size 2*x
    font-family FontAwesome
    text-align center
    color #fff

  // youtube embed (responsive) 
  div.youtube iframe
    width 100%
    height 100%
    position absolute
    top 0
    left 0
    z-index 3

@media screen and (min-width: 360px)
  .page-presentations-entry
    .youtube
      margin-left -1.5*x
      margin-right -1.5*x

@media screen and (min-width: 768px)
  .page-presentations-entry
    .youtube
      margin-bottom 1.5em
      margin-left -1.25*x
      margin-right -1.25*x
    div.youtube
      margin-bottom 0

@media screen and (min-width: 800px)
  .page-presentations-entry
    .youtube
      margin-left auto
      margin-right auto
</style>
