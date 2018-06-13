<template lang="pug">
page(title='New Proposal')
  div(slot="menu"): tool-bar
    router-link(to="/proposals" exact v-tooltip.bottom="'Back'")
      i.material-icons arrow_back
  part(title='Choose a Type')
    tm-list-item(title='Adjust Parameters' to="/proposals/new/adjust")
    tm-list-item(title='Amend Constitution' to="/proposals/new/amend")
    tm-list-item(title='Create Atoms' to="/proposals/new/create")
    tm-list-item(title='Plain Text' to="/proposals/new/text")
    tm-list-item(title='Upgrade Code' to="/proposals/new/upgrade")
</template>

<script>
import { TmListItem } from "@tendermint/ui"
import Page from "common/NiPage"
import Part from "common/NiPart"
import ToolBar from "common/NiToolBar"
export default {
  name: "page-proposals-new",
  components: {
    TmListItem,
    Page,
    Part,
    ToolBar
  }
}
</script>
