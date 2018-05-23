<template lang="pug">
page(
  title="Validators"
  subtitle="What is a Cosmos Validator? How can you run one?")
  div(slot="menu")
    btn(icon="chat" value="Validator Chat" type="anchor" href="https://riot.im/app/#/room/#cosmos_validators:matrix.org" target="_blank" color="primary")
    btn(icon="chat" value="Validator Forum" type="anchor" href="https://forum.cosmos.network/c/validating" target="_blank")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/validators-index.md')
  text-container
    h4 Next&hellip;
    btn(value="Validator FAQ" type="link" :to="{ name: 'validator-faq' }" icon="chevron_right" icon-pos="right" color="primary" size="lg")
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-validators-index",
  metaInfo: { title: "Overview - Validators" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
