<template lang='pug'>
.tm-modal-search(v-if="open")
  form.tm-modal-search-container(
    v-if="type === 'blocks'"
    v-on:submit.prevent.default="gotoBlock")
    tm-form-group(field-id="search-input" field-label=""
      :error="$v.filters.blocks.search.query.$invalid")
      .tm-modal-search-field
        tm-field#search-input.mousetrap(
          type="number"
          step="1"
          placeholder="View block height..."
          v-model="query")
        tm-btn(value="Find")
        tm-btn(type="button" icon="close" @click.native="close")
      tm-form-msg(name="Query" type="numeric"
        v-if="!$v.filters.blocks.search.query.numeric")
      tm-form-msg(name="Query" type="between" min="0"
        :max="$v.filters.blocks.search.query.$params.between.max"
        v-if="!$v.filters.blocks.search.query.between")
  .tm-modal-search-container(v-else)
    tm-form-group(field-id="search-input" field-label="")
      .tm-modal-search-field
        tm-field#search-input.mousetrap(
          type="text" placeholder="Search..." v-model="query")
        tm-btn(icon="close" @click.native="close")
</template>

<script>
import { between, numeric } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import { TmBtn, TmFormGroup, TmField, TmFormMsg } from "@tendermint/ui"
export default {
  name: "modal-search",
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  computed: {
    ...mapGetters(["filters", "lastHeader"]),
    open() {
      return this.filters[this.type].search.visible
    },
    query: {
      get() {
        return this.filters[this.type].search.query
      },
      set(string) {
        this.$store.commit("setSearchQuery", [this.type, string])
      }
    }
  },
  methods: {
    close() {
      this.$store.commit("setSearchVisible", [this.type, false])
    },
    gotoBlock() {
      this.$router.push({
        name: "block",
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
            between(height) {
              return between(1, this.lastHeader.height)(height)
            }
          }
        }
      }
    }
  }),
  watch: {
    open(open) {
      if (open) {
        setTimeout(() => {
          let el = this.$el.querySelector(".tm-field")
          el.select()
        })
      }
    }
  },
  props: ["type"]
}
</script>

<style lang="stylus">
@require '~variables'
.tm-modal-search
  position sticky
  top 0
  z-index z(modal)
  width 100%
.tm-modal-search-container
  background var(--app-fg)
  margin-bottom 1rem
  padding 0.5rem 0

  .tm-btn
    margin-left 0.5rem
  .tm-field
    background var(--app-bg)

.tm-modal-search-field
  display flex
  flex 1
  .tm-field
    width auto
    flex 1
</style>
