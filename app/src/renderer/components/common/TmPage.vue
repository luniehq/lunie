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
    ...mapGetters([`user`, `filters`, `connected`]),
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
      return this.dataset && this.dataset.length > 0
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
  font-size: var(--h2);
  padding: 0.5rem 1rem 1rem;
}

.tm-page-subtitle > div {
  color: var(--dim);
  font-size: var(--sm);
}

.column {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.row-unjustified {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.page-profile__section {
  margin-bottom: 1rem;
}

.page-profile__section--between > .row {
  justify-content: space-between;
}

.page-profile__header {
  background-color: var(--app-fg);
}

.page-profile__header .row:first-child {
  border: 1px solid var(--bc-dim);
}

.page-profile__header .avatar {
  background: var(--app-nav);
  height: 8rem;
  width: 8rem;
  margin: 1rem 2rem 1rem 1rem;
  padding: 1rem;
}

.page-profile__header__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
}

.page-profile__status-and-title {
  position: relative;
}

.page-profile__status {
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  left: -1rem;
  top: 1rem;
  position: absolute;
  width: 0.5rem;
}

.page-profile__title {
  color: #fff;
  display: inline-block;
  font-size: var(--h1);
  line-height: var(--h1);
  font-weight: 400;
  padding: 0 0.5rem 0.5rem 0;
}

.page-profile__header__actions {
  display: flex;
  flex-direction: column;
  margin-right: 2rem;
}

.page-profile__header__actions button:first-child {
  margin-bottom: 0.5rem;
}

.page-profile__status.red {
  background: var(--danger);
}

.page-profile__status.yellow {
  background: var(--warning);
}

.page-profile__status.green {
  background: var(--success);
}

.page-profile__status.blue {
  background: var(--primary);
}

.colored_dl {
  width: 100%;
}

.info_dl {
  padding: 1rem;
  border: 1px solid var(--bc-dim);
  background-color: var(--app-fg);
}

.info_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 2px;
  font-weight: 500;
}

.info_dl dd {
  font-size: 1rem;
  line-height: 1.25rem;
  color: var(--bright);
  word-break: break-all;
}

@media screen and (min-width: 768px) {
  .tm-page-main {
    padding: 1rem;
  }
}
</style>
