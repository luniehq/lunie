<template lang="pug">
page(title="Contribute" )
  div(slot="subtitle") Tendermint Core is a free and open source project with contributors from around the world. Your help is much appreciated!
  div(slot="menu")
    btn(icon="description" value="Documentation" type="anchor" href="https://tendermint.readthedocs.io/en/master/index.html" color="primary" target="_blank")
    btn(icon="code" value="View Source" type="anchor" href="https://github.com/tendermint/tendermint" target="_blank")
  part(title='Issues we could use help on')
    card-issue(v-for="i in issues" :key="i.id" :issue="i")
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import CardIssue from "./CardIssue"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-contribute",
  metaInfo: { title: "Contribute to Tendermint Core" },
  components: {
    Btn,
    CardIssue,
    Page,
    Part
  },
  computed: {
    ...mapGetters(["issues"])
  }
}
</script>
