<template lang="pug">
page(title="Error 404" subtitle="Page Not Found")
  div(slot="menu")
    btn(icon="bug_report" value="Report Error" type="anchor" :href="links.cosmos.community.matrix" color="primary" target="_blank")

  text-container
    p
      strong Whoops!
      |  The page you visited either does not exist or has been moved elsewhere in a website reshuffle. We&apos;re sorry for the inconvenience. Try visiting one of these pages below:
    ul
      li
        router-link(to='/') Home
      li
        router-link(to='/downloads') Downloads
      li
        router-link(to='/careers') Careers
      li
        router-link(to='/about') About
    p
      | Please notify us in 
      a(:href="links.cosmos.community.matrix") Developer Chat
      |  and we will fix this error as soon as we can. Thank you for your patience.
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-404",
  metaInfo: { title: "404" },
  components: {
    Btn,
    Page,
    TextContainer
  },
  computed: { ...mapGetters(["links"]) }
}
</script>
