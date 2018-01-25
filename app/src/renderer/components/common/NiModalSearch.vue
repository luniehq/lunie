<template lang='pug'>
.ni-modal-search(v-if="open")
  form.ni-modal-search-container(
    v-if="type === 'blocks'"
    v-on:submit.prevent.default="gotoBlock")
    field.mousetrap(
      type="number"
      step="1"
      placeholder="Search for block height..."
      v-model="query")
    btn(value="Search")
    btn(type="button" icon="close" @click.native="close")
  .ni-modal-search-container(v-else)
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
    },
    gotoBlock () {
      this.$router.push({
        name: 'block',
        params: { block: this.filters.blocks.search.query }
      })
    }
  },
  watch: {
    open (open) {
      if (open) {
        setTimeout(() => {
          let el = this.$el.querySelector('.ni-field')
          el.select()
        })
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

  .ni-btn
    margin-left 0.5rem
</style>
