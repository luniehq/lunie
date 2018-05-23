<template lang="pug">
page(title="Developers" subtitle="Learn about and contribute to the code that powers the Cosmos Network.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(url="https://api.github.com/repos/tendermint/aib-data/contents/md/developers-index.md")
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import Part from "common/NiPart"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-developers-index",
  metaInfo: { title: "Overview - Developers" },
  components: {
    Btn,
    Page,
    Part,
    TextContainer
  }
}
</script>
