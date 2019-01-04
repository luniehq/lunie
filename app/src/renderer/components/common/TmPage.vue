<template>
  <div class="tm-page">
    <tm-page-header>
      <h2 v-if="title" slot="title">{{ title }}</h2>
      <h3 v-if="subtitle" slot="subtitle">{{ subtitle }}</h3>
      <slot slot="menu-body" name="menu-body">
        <tm-balance />
        <tool-bar>
          <a
            v-tooltip.bottom="'Refresh'"
            :disabled="!connected"
            class="refresh-button"
            @click="connected && refreshTransactions()"
          >
            <i class="material-icons">refresh</i>
          </a>
          <a
            v-tooltip.bottom="'Search'"
            :disabled="!somethingToSearch"
            class="search-button"
            @click="setSearch()"
          >
            <i class="material-icons">search</i>
          </a>
        </tool-bar>
      </slot>
      <slot slot="menu" name="menu" />
    </tm-page-header>
    <main class="tm-page-main">
      <modal-search
        v-if="search && search.somethingToSearch"
        :type="search.type"
      />

      <tm-data-connecting v-if="!loaded && !connected" />
      <tm-data-loading v-else-if="!loaded && loading" />
      <tm-data-error v-else-if="error" />
      <slot
        v-else-if="data.length === 0 && this.$slots['no-data']"
        name="no-data"
      />
      <tm-data-empty v-else-if="data.length === 0" />
      <data-empty-search v-else-if="filteredData.length === 0" />
      <slot v-else name="managed-body" /> <slot />
    </main>
  </div>
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar"
import TmPageHeader from "./TmPageHeader.vue"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
import TmDataEmpty from "common/TmDataEmpty"
import DataEmptySearch from "common/TmDataEmptySearch"
import Mousetrap from "mousetrap"
import TmDataError from "common/TmDataError"
import ModalSearch from "common/TmModalSearch"
import TmDataConnecting from "common/TmDataConnecting"

export default {
  name: `tm-page`,
  components: {
    TmPageHeader,
    TmDataMsg,
    TmDataEmpty,
    TmDataLoading,
    DataEmptySearch,
    TmDataError,
    TmDataConnecting,
    ModalSearch
  },
  props: {
    title: {
      type: String,
      default: ``
    },
    subtitle: {
      type: String,
      default: ``
    },
    "menu-body": {
      type: String,
      default: ``
    },
    search: {
      type: Object,
      default: () => undefined
    },
    error: {
      type: Object,
      default: () => undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    connected: {
      type: Boolean,
      default: () => undefined
    },
    loaded: {
      type: Boolean,
      default: () => undefined
    },
    data: {
      type: Array,
      default: () => []
    },
    filteredData: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({ ps: `` }),
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    await this.$nextTick()
    const container = this.$el.querySelector(`.tm-page-main`)
    this.ps = new PerfectScrollbar(container)
  },
  methods: {
    setSearch(
      bool = !this.filters[this.search.type].search.visible,
      { somethingToSearch, $store } = this
    ) {
      if (somethingToSearch) {
        $store.commit(`setSearchVisible`, [this.search.type, bool])
      }
    },
    somethingToSearch() {
      return this.data.length > 0
    }
  }
}
</script>

<style>
.tm-page {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  width: 100%;
}

.tm-page-main {
  flex: 1;
  position: relative;
}

.tm-page-title {
  color: var(--bright);
  font-size: h2;
  padding: 0.5rem 1rem 1rem;
}

.tm-page-subtitle > div {
  color: var(--dim);
  font-size: var(--sm);
}

@media screen and (min-width: 768px) {
  .tm-page-main {
    padding: 1rem;
  }
}
</style>
