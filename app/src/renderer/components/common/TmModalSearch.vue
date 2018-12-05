<template>
  <div v-if="open" class="tm-modal-search">
    <form
      v-if="type === 'blocks'"
      class="tm-modal-search-container"
      @submit.prevent="gotoBlock"
    >
      <tm-form-group
        :error="$v.filters.blocks.search.query.$invalid"
        field-id="search-input"
        field-label=""
      >
        <div class="tm-modal-search-field">
          <tm-field
            id="search-input"
            v-model="query"
            class="mousetrap"
            type="number"
            step="1"
            placeholder="View block height..."
          />
          <tm-btn value="Find" />
          <tm-btn type="button" icon="close" @click.native="close" />
        </div>
        <tm-form-msg
          v-if="!$v.filters.blocks.search.query.numeric"
          name="Query"
          type="numeric"
        />
        <tm-form-msg
          v-if="!$v.filters.blocks.search.query.between"
          :max="$v.filters.blocks.search.query.$params.between.max"
          name="Query"
          type="between"
          min="0"
        />
      </tm-form-group>
    </form>
    <div v-else class="tm-modal-search-container">
      <tm-form-group field-id="search-input" field-label="">
        <div class="tm-modal-search-field">
          <tm-field
            id="search-input"
            v-model.trim="query"
            class="mousetrap"
            type="text"
            placeholder="Search..."
          />
          <tm-btn icon="close" @click.native="close" />
        </div>
      </tm-form-group>
    </div>
  </div>
</template>

<script>
import { between, numeric } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import { TmBtn, TmFormGroup, TmField, TmFormMsg } from "@tendermint/ui"
export default {
  name: `modal-search`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    type: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters([`filters`, `lastHeader`]),
    open() {
      return this.filters[this.type].search.visible
    },
    query: {
      get() {
        return this.filters[this.type].search.query
      },
      set(string) {
        this.$store.commit(`setSearchQuery`, [this.type, string])
      }
    }
  },
  watch: {
    open(open) {
      if (open) {
        setTimeout(() => {
          let el = this.$el.querySelector(`.tm-field`)
          el.select()
        })
      }
    }
  },
  methods: {
    close() {
      this.$store.commit(`setSearchVisible`, [this.type, false])
    },
    gotoBlock() {
      this.$router.push({
        name: `block`,
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
  })
}
</script>

<style>
.tm-modal-search {
  position: sticky;
  top: 0;
  z-index: var(--z-modal);
  width: 100%;
}

.tm-modal-search-container {
  background: var(--app-fg);
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.tm-modal-search-container .tm-btn {
  margin-left: 0.5rem;
}

.tm-modal-search-container .tm-field {
  background: var(--app-bg);
}

.tm-modal-search-field {
  display: flex;
  flex: 1;
}

.tm-modal-search-field .tm-field {
  width: auto;
  flex: 1;
}
</style>
