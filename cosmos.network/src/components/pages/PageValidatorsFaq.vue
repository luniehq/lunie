<template lang="pug">
page(
  title="Validator FAQ"
  subtitle="Frequently asked questions and answers about Cosmos Validators.")
  div(slot="menu")
    btn(icon="chat" value="Validator Chat" type="anchor" href="https://riot.im/app/#/room/#cosmos_validators:matrix.org" target="_blank" color="primary")
    btn(icon="chat" value="Validator Forum" type="anchor" href="https://forum.cosmos.network/c/validating" target="_blank")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/resources-validator-faq.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-validator-faq",
  metaInfo: { title: "FAQ - Validators" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
