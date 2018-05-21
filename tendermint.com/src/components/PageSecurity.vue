<template lang="pug">
page(title="Security" subtitle="At Tendermint, we highly value security. Learn about how we deal with security and vulnerability reports below.")
  div(slot="menu")
    btn(icon="bug_report" value="Report Bug" type="anchor" href="mailto:security@tendermint.com" color="primary")
  text-container(url='https://api.github.com/repos/tendermint/aib-data/contents/md/security.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-security",
  metaInfo: { title: "Security" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
