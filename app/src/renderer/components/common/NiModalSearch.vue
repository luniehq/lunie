<template lang='pug'>
.ni-modal-search(v-if="open"): .ni-modal-search-container
  field.mousetrap(type="text" placeholder="Search..." v-model="query")
  btn(icon="close" @click.native="close")
</template>

<script>
import {mapGetters} from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
export default {
  name: 'modal-search',
  components: {
    Btn,
    Field
  },
  computed: {
    ...mapGetters(['filters']),
    open () {
      return this.filters[this.type].search.visible
    },
    query: {
      get () {
        return this.filters[this.type].search.query
      },
      set (string) {
        this.$store.commit('setSearchQuery', [this.type, string])
      }
    }
  },
  methods: {
    close () {
      this.$store.commit('setSearchVisible', [this.type, false])
    }
  },
  watch: {
    open (open) {
      if (open) {
        let el = this.$el.querySelector('.ni-field')
        el.select()
      }
    }
  },
  props: ['type']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-modal-search-container
  display flex
  padding 0 1rem 1rem

  .ni-field
    margin-right 0.5rem

@media screen and (min-width 1024)
  .ni-modal-search-container
    margin-left width-side
</style>
