<template lang='pug'>
.ni-modal-search: .ni-modal-search-container
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
  mounted () {
    let el = this.$el.querySelector('.ni-field')
    el.select()
  },
  props: ['type']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-modal-search
  height 3rem

  position fixed
  bottom 0
  left 0
  width 100vw

  z-index 100

.ni-modal-search-container
  display flex
  height 3rem
  padding 0.5rem
  background app-fg
  border-top 1px solid bc
  .ni-field
    margin-right 0.5rem

@media screen and (min-width 1024)
  .ni-modal-search-container
    margin-left width-side
</style>
