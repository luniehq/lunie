<template lang='pug'>
.ni-modal-search(v-if="open")
  form.ni-modal-search-container(
    v-if="type === 'blocks'"
    v-on:submit.prevent.default="gotoBlock")
    form-group(field-id="search-input" field-label=""
      :error="$v.filters.blocks.search.query.$invalid")
      .ni-modal-search-field
        field#search-input.mousetrap(
          type="number"
          step="1"
          placeholder="View block height..."
          v-model="query")
        btn(value="Go")
        btn(type="button" icon="close" @click.native="close")
      form-msg(name="Query" type="numeric"
        v-if="!$v.filters.blocks.search.query.numeric")
      form-msg(name="Query" type="between" min="0"
        :max="$v.filters.blocks.search.query.$params.between.max"
        v-if="!$v.filters.blocks.search.query.between")
  .ni-modal-search-container(v-else)
    form-group(field-id="search-input" field-label="")
      .ni-modal-search-field
        field#search-input.mousetrap(
          type="text" placeholder="Search..." v-model="query")
        btn(icon="close" @click.native="close")
</template>

<script>
import { between, numeric } from 'vuelidate/lib/validators'
import {mapGetters} from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FormGroup from 'common/NiFormGroup'
import FormMsg from 'common/NiFormMsg'
export default {
  name: 'modal-search',
  components: {
    Btn,
    Field,
    FormGroup,
    FormMsg
  },
  computed: {
    ...mapGetters(['filters', 'lastHeader']),
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
  validations: () => ({
    filters: {
      blocks: {
        search: {
          query: {
            numeric,
            between (height) {
              return between(1, this.lastHeader.height)(height)
            }
          }
        }
      }
    }
  }),
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
  background app-fg
  margin-bottom 1rem
  padding 0.5rem 0

  .ni-btn
    margin-left 0.5rem
  .ni-field
    background app-bg

.ni-modal-search-field
  display flex
  flex 1
  .ni-field
    width auto
    flex 1
</style>
