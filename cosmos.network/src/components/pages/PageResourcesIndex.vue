<template lang="pug">
page(title="Resources" subtitle="A curated list of resources about the Cosmos Network.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  part(title="Cosmos Network")
    list-item(:to="{ name: 'whitepaper' }" title="Cosmos Whitepaper" icon="description")
    list-item(:to="{ name: 'faq' }" title="Cosmos FAQ" icon="description")
    list-item(:to="{ name: 'plan' }" title="Cosmos Fundraiser Plan" icon="description")
    list-item(:to="{ name: 'academy' }" title="Cosmos Academy" icon="school")
    list-item(:to="{ name: 'assets' }" title="Cosmos Visual Assets" icon="wallpaper")
  part(title="Cosmos Hub")
    list-item(:to="{ name: 'delegators' }" title="Delegator Guide" icon="description")
    list-item(:to="{ name: 'validator-faq' }" title="Validator FAQ" icon="description")
    list-item(href="https://github.com/cosmos/cosmos/raw/master/Cosmos_Token_Model.pdf" title="Cosmos Token Model (PDF)" icon="cloud_download")
  part(title="Unofficial Resources")
    list-item(href="https://medium.com/@JesseLivermore/basic-notable-cosmos-resources-aff336febe15" title="Basic Notable Cosmos Resources" icon="link" target="_blank")
</template>

<script>
import Btn from "@nylira/vue-button"
import ListItem from "common/NiListItem"
import Part from "common/NiPart"
import Page from "common/NiPage"
export default {
  name: "page-resources-index",
  metaInfo: { title: "Resources" },
  components: {
    Btn,
    ListItem,
    Page,
    Part
  }
}
</script>
