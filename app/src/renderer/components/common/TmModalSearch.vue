<template>
  <div v-if="open" class="tm-modal-search">
    <div class="tm-modal-search-container">
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
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
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
          el.focus()
        })
      }
    }
  },
  methods: {
    close() {
      this.$store.commit(`setSearchVisible`, [this.type, false])
    }
  }
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
