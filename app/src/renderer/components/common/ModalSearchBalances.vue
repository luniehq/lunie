<template lang='pug'>
modal-search
  field.mousetrap(type="text" placeholder="Search..." v-model="query")
  btn(icon="close" @click.native="close")
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import ModalSearch from './ModalSearch'
export default {
  name: 'modal-search-candidates',
  components: {
    Btn,
    Field,
    ModalSearch
  },
  computed: {
    ...mapGetters(['filters']),
    query: {
      get () {
        return this.filters.balances.search.query
      },
      set (val) {
        this.$store.commit('setBalancesSearchQuery', val)
      }
    }
  },
  methods: {
    close () {
      this.$store.commit('setBalancesSearchVisible', false)
    }
  },
  mounted () {
    let el = this.$el.querySelector('.ni-field')
    el.select()
  }
}
</script>
