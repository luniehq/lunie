<template lang="pug">
page(title="Scaling Ethereum" subtitle="Held back by Ethereum performance? Here are different approaches to scaling your Dapp on the Cosmos stack.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/developers-scaling-eth.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer.vue"
export default {
  name: "page-developers-scaling",
  metaInfo: { title: "Scaling Ethereum - Developers" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
