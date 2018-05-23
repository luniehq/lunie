<template lang="pug">
page(title="Wallet Development" subtitle="[Coming Soon] Learn how to develop a custom wallet for the Cosmos Network.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/developers-wallet.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer.vue"
export default {
  name: "page-developers-wallet",
  metaInfo: { title: "Wallet - Developers" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
