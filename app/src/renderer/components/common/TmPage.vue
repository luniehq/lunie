<template>
  <div class="tm-page">
    <tm-page-header v-if="!hideHeader" :tabs="tabs">
      <h2 v-if="title" slot="title">{{ title }}</h2>
      <h3 v-if="subtitle" slot="subtitle">{{ subtitle }}</h3>
      <slot slot="menu-body" name="menu-body">
        <tm-balance />
        <tool-bar :refresh="refreshable" :searching="searchable" />
      </slot>
      <slot slot="header-buttons" name="header-buttons" />
      <slot slot="menu" name="menu" />
    </tm-page-header>
    <main class="tm-page-main">
      <modal-search v-if="search && somethingToSearch" :type="search" />

      <template v-if="this.$slots['managed-body']">
        <tm-data-connecting v-if="!loaded && !connected" />
        <tm-data-loading v-else-if="!loaded && loading" />
        <tm-data-error v-else-if="error" />
        <slot
          v-else-if="dataset.length === 0 && this.$slots['no-data']"
          name="no-data"
        />
        <tm-data-empty v-else-if="dataset.length === 0" />
        <data-empty-search v-else-if="!hasFilteredData" />
        <slot v-else name="managed-body" />
      </template>
      <slot />
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
import { mapGetters } from "vuex"
import Mousetrap from "mousetrap"
import TmDataError from "common/TmDataError"
import ModalSearch from "common/TmModalSearch"
import TmDataConnecting from "common/TmDataConnecting"
import TmBalance from "common/TmBalance"
import ToolBar from "common/ToolBar"

export default {
  name: `tm-page`,
  components: {
    TmBalance,
    ToolBar,
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
    hideHeader: {
      type: Boolean,
      default: false
    },
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
      type: String,
      default: ``
    },
    error: {
      type: Object,
      default: undefined
    },
    tabs: {
      type: Array,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    loaded: {
      type: Boolean,
      default: undefined
    },
    dataset: {
      type: Array,
      default: undefined
    },
    hasFilteredData: {
      type: Boolean,
      default: false
    },
    refresh: {
      type: Function,
      default: undefined
    }
  },
  data: () => ({ ps: `` }),
  computed: {
    ...mapGetters([`filters`, `connected`]),
    searchable({ somethingToSearch, setSearch } = this) {
      return this.search ? { somethingToSearch, setSearch } : undefined
    },
    refreshable({ connected, refresh } = this) {
      return refresh ? { connected, refresh } : undefined
    }
  },
  async mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))

    await this.$nextTick()
    const container = this.$el.querySelector(`.tm-page-main`)
    this.ps = new PerfectScrollbar(container)
  },
  methods: {
    setSearch(bool = true, { somethingToSearch, $store } = this) {
      if (somethingToSearch()) {
        $store.commit(`setSearchVisible`, [this.search, bool])
      }
    },
    somethingToSearch() {
      return this.dataset.length > 0
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
