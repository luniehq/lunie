<template lang="pug">
page(icon="view_list" title="All Discussions")
  // toolbar desktop
  div(slot="menu")
    btn(type="link" :to="routeNewProposal" icon="add" value="New Draft" exact)

  // toolbar mobile
  tool-bar
    div
    router-link(:to="routeNewProposal")
      i.material-icons add
      | New Draft

  app-table-of-contents
</template>

<script>
import {mapGetters} from 'vuex'
import Btn from '@nylira/vue-button'
import AppTableOfContents from 'common/AppTableOfContents'
import Page from 'common/NiPage'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-index',
  components: {
    AppTableOfContents,
    Btn,
    ToolBar,
    Page
  },
  computed: {
    ...mapGetters(['user']),
    routeNewProposal () {
      // hardcode to draft proposal
      return {name: 'proposal-new', params: {stage: 'drafts'}}
    }
  }
}
</script>
