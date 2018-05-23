<template lang="pug">
page(title="Going Further" subtitle="Wish to learn more?")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  part(title="More Resources")
    list-item(:to="{ name: 'whitepaper' }" title="Read the Cosmos whitepaper" icon="description")
    list-item(:to="{ name: 'faq' }" title="Read the Cosmos FAQ" icon="description")
    list-item(:to="{ name: 'testnet' }" title="Participate in the testnet" icon="description")
    list-item(:to="{ name: 'developers' }" title="Learn how to develop on Cosmos" icon="description")
</template>

<script>
import Btn from "@nylira/vue-button"
import ListItem from "common/NiListItem"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-intro-further",
  metaInfo: { title: "Going Further - Intro" },
  components: {
    Btn,
    ListItem,
    Page,
    Part
  }
}
</script>
