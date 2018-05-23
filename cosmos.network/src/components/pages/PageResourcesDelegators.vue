<template lang="pug">
page(
  title="Delegator Guide"
  subtitle="Discover how to earn revenue by staking your atoms to a validator with Cosmos Voyager.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/resources-delegators.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-delegator-guide",
  metaInfo: { title: "Delegator Guide - Resources" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
