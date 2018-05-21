<template lang="pug">
page(title="What is the Cosmos Hub?" subtitle="The Cosmos Hub is the first hub zone on the Cosmos Network.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(url="https://api.github.com/repos/tendermint/aib-data/contents/md/intro-hub.md")
  text-container
    h4 Next&hellip;
    btn(value="Going Further" type="link" :to="{ name: 'intro-further' }" icon="chevron_right" icon-pos="right" color="primary" size="lg")
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-intro-hub",
  metaInfo: { title: "Cosmos Hub - Intro" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
