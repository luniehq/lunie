<template lang='pug'>
modal-search
  field.mousetrap(type="text" placeholder="Search..." v-model="query")
  btn(icon="close" @click.native="close")
</template>

<script>
import { mapGetters } from 'vuex'
import Mousetrap from 'mousetrap'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import ModalSearch from './ModalSearch'
export default {
  name: 'modal-search-proposals',
  components: {
    Btn,
    Field,
    ModalSearch
  },
  computed: {
    ...mapGetters(['filters']),
    query: {
      get () {
        return this.filters.proposals.search.query
      },
      set (val) {
        this.$store.commit('setProposalsSearchQuery', val)
      }
    }
  },
  methods: {
    close () {
      this.$store.commit('setProposalsSearchVisible', false)
    }
  },
  mounted () {
    let el = this.$el.querySelector('.ni-field')
    el.select()
  }
}
</script>
