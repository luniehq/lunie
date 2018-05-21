<template lang="pug">
page(
  title="Testnet Tutorial"
  subtitle="Learn how to run a validator node on the latest Cosmos testnet.")
  div(slot="menu")
    btn(icon="chat" value="Validator Chat" type="anchor" href="https://riot.im/app/#/room/#cosmos_validators:matrix.org" target="_blank" color="primary")
    btn(icon="chat" value="Validator Forum" type="anchor" href="https://forum.cosmos.network/c/validating" target="_blank")
  text-container(
    url='https://api.github.com/repos/cosmos/testnet/contents/README.md')
</template>

<script>
import Btn from "@nylira/vue-button"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-validators-testnet",
  metaInfo: { title: "Testnet Tutorial - Validators" },
  components: {
    Btn,
    Page,
    TextContainer
  }
}
</script>
