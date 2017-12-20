<template lang="pug">
page(title='Validators')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
  modal-search(v-if="filters.validators.search.visible" type="validators")

  data-empty(v-if="validators.length === 0")
  data-empty-search(v-else-if="filteredValidators.length === 0")
  list-item(
    v-else
    v-for="i in filteredValidators"
    icon='storage'
    :key="i.pub_key.data"
    :subtitle="`${i.voting_power} ATOM`"
    :title="i.pub_key.data"
    :to="`/validators/${urlsafeIp(i.pub_key.data)}`")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import ListItem from 'common/NiListItem'
import DataEmpty from 'common/NiDataEmpty'
import DataEmptySearch from 'common/NiDataEmptySearch'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import TabBar from 'common/NiTabBar'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-validators',
  components: {
    DataEmpty,
    DataEmptySearch,
    ListItem,
    ModalSearch,
    Page,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['validators', 'filters']),
    filteredValidators () {
      let query = this.filters.validators.search.query
      let list = orderBy(this.validators, ['pub_key.data', 'desc'])
      if (this.filters.validators.search.visible) {
        return list.filter(i => includes(i.pub_key.data, query))
      } else {
        return list
      }
    },
    online () { return this.validators.length }
  },
  methods: {
    setSearch (bool) { this.$store.commit('setSearchVisible', ['validators', bool]) },
    urlsafeIp (ip) { return ip.split('.').join('-') }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
