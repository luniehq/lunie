<template lang="pug">
page(
  title="Fundraiser Plan"
  subtitle="Our original plan and roadmap for the April 2017 fundraiser.")
  div(slot="menu"): btn(icon="chat" value="Community Chat" type="anchor" href="https://riot.im/app/#/group/+cosmos:matrix.org" target="_blank" color="primary")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/resources-plan.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import TextContainer from "common/NiTextContainer"
import Page from "common/NiPage"
export default {
  name: "page-plan",
  metaInfo: { title: "Fundraiser Plan - Resources" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
