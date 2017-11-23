<template lang="pug">
page(title='New Proposal')
  div(slot="menu"): tool-bar
    router-link(to="/" exact): i.material-icons arrow_back
  part(title='Choose a Type')
    list-item(title='Adjust Parameters' to="/proposals/new/adjust")
    list-item(title='Amend Constitution' to="/proposals/new/amend")
    list-item(title='Create Atoms' to="/proposals/new/create")
    list-item(title='Plain Text' to="/proposals/new/text")
    list-item(title='Upgrade Code' to="/proposals/new/upgrade")
</template>

<script>
import ListItem from '../common/NiListItem'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-proposals-new',
  components: {
    ListItem,
    Page,
    Part,
    ToolBar
  }
}
</script>
