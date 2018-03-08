<template lang="pug">
page(title='Validators and Candidates')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    a(@click='updateDelegates(address)')
      i.material-icons refresh
      .label Refresh

  modal-search(type="delegates")

  .delegates-container
    data-loading(v-if="delegates.loading")
    data-empty(v-else-if="delegates.delegates.length === 0")
    data-empty-search(v-else-if="filteredDelegates.length === 0")
    template(v-else)
      panel-sort(:sort='sort')
      li-delegate(v-for='i in filteredDelegates' :key='i.id' :delegate='i')

  .fixed-button-bar(v-if="!delegates.loading")
    template(v-if="userCanDelegate")
      .label #[strong {{ shoppingCart.length }}] delegates selected
      btn(type="link" to="/staking/bond" :disabled="shoppingCart.length < 1" icon="chevron_right" icon-pos="right" value="Next" color="primary")
    template(v-else)
      .label You do not have any ATOMs to delegate.
      btn(disabled icon="chevron_right" icon-pos="right" value="Next" color="primary")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy, forEach } from 'lodash'
import Mousetrap from 'mousetrap'
import LiDelegate from 'staking/LiDelegate'
import Btn from '@nylira/vue-button'
import DataEmpty from 'common/NiDataEmpty'
import DataEmptySearch from 'common/NiDataEmptySearch'
import DataLoading from 'common/NiDataLoading'
import Field from '@nylira/vue-field'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import PanelSort from 'staking/PanelSort'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegates',
  components: {
    LiDelegate,
    Btn,
    DataEmpty,
    DataEmptySearch,
    DataLoading,
    Field,
    ModalSearch,
    Page,
    Part,
    PanelSort,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegates', 'filters', 'shoppingCart', 'config', 'user']),
    address () {
      return this.user.address
    },
    filteredDelegates () {
      let query = this.filters.delegates.search.query

      forEach(this.delegates.delegates, function (v) {
        v.small_moniker = v.moniker.toLowerCase()
      })
      let delegates = orderBy(this.delegates.delegates, [this.sort.property], [this.sort.order])

      if (this.filters.delegates.search.visible) {
        return delegates.filter(i => includes(JSON.stringify(i).toLowerCase(), query.toLowerCase()))
      } else {
        return delegates
      }
    },
    userCanDelegate () {
      return this.user.atoms > 0
    }
  },
  data: () => ({
    query: '',
    sort: {
      property: 'shares',
      order: 'desc',
      properties: [
        {
          title: 'Name', value: 'small_moniker', class: 'name'
        },
        {
          title: '% of Vote', value: 'shares', class: 'percent_of_vote'
        },
        {
          title: 'Total Votes', value: 'voting_power', class: 'voting_power'
        },
        {
          title: 'Your Votes', value: 'your_votes', class: 'your-votes'
        },
        {
          title: 'Status', value: 'isValidator', class: 'status'
        },
        {
          title: '', value: '', class: 'action hidden'
        }
      ]
    }
  }),
  watch: {
    address: function (address) {
      address && this.updateDelegates(address)
    }
  },
  methods: {
    async updateDelegates (address) {
      let candidates = await this.$store.dispatch('getDelegates')
      this.$store.dispatch('getBondedDelegates', candidates)
    },
    setSearch (bool) {
      this.$store.commit('setSearchVisible', ['delegates', bool])
    }
  },
  async mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
    await this.updateDelegates(this.user.address)
  }
}
</script>
<style lang="stylus">
@require '~variables'

.delegates-container
  padding-bottom 3rem

.fixed-button-bar
  padding 0.5rem 1rem
  background alpha(app-bg, 90%)
  display flex
  justify-content space-between
  position fixed
  bottom 3rem + px
  left 0
  right 0
  z-index z(toolBar)

  .label
    color bright
    line-height 2rem
    strong
      font-weight bold

@media screen and (min-width: 768px)
    padding-bottom 4rem

  .fixed-button-bar
    padding 1rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
