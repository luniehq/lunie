<template lang="pug">
page(title="Cosmos FAQ" subtitle="Answers to frequently asked questions about the Cosmos Network.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(url="https://api.github.com/repos/tendermint/aib-data/contents/md/resources-faq.md")
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import PageMenu from "common/NiPageMenu"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-faq",
  metaInfo: { title: "Cosmos FAQ - Resources" },
  components: {
    Btn,
    Page,
    PageMenu,
    TextContainer
  }
}
</script>
