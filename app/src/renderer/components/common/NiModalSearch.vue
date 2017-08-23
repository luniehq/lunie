<template lang='pug'>
.ni-modal-search
  .ni-modal-search-container
    field(type="text" placeholder="Search..." v-model="query")
    btn(icon="close" @click.native="close")
</template>

<script>
import Field from '@nylira/vue-field'
import Btn from '@nylira/vue-button'
import { mapGetters } from 'vuex'
export default {
  name: 'ni-modal-search',
  components: {
    Btn,
    Field
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
      this.$destroy()
      this.$store.commit('setProposalsSearchVisible', false)
    }
  },
  mounted () {
    let el = this.$el.querySelector('.ni-field')
    console.log('el', el)
    el.select()
  }
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-modal-search
  height 3rem
  width 100vw

  position fixed
  top 0
  right 0
  width 20rem

  background #000
  z-index 100

.ni-modal-search-container
  display flex
  height 3rem
  padding 0.5rem
</style>
