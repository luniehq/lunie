<template>
  <div class="tm-page">
    <TmPageHeader v-if="!hideHeader" :tabs="tabs">
      <h2 v-if="title" slot="title">
        {{ title }}
      </h2>
      <h3 v-if="subtitle" slot="subtitle">
        {{ subtitle }}
      </h3>
      <slot slot="menu-body" name="menu-body">
        <TmBalance v-if="session.signedIn" />
        <ToolBar :refresh="refreshable" />
      </slot>
      <slot slot="header-buttons" name="header-buttons" />
    </TmPageHeader>
    <main class="tm-page-main">
      <CardSignInRequired v-if="signInRequired && !session.signedIn" />
      <template v-else-if="managed">
        <TmDataConnecting v-if="!loaded && !connected" />
        <TmDataLoading v-else-if="!loaded && loading" />
        <TmDataError v-else-if="error" />
        <slot v-else-if="dataEmpty" name="no-data">
          <TmDataEmpty>
            <template slot="title">
              <slot name="title" />
            </template>
            <template slot="subtitle">
              <slot name="subtitle" />
            </template>
          </TmDataEmpty>
        </slot>
        <slot v-else name="managed-body" />
      </template>
      <slot />
    </main>
    <PageFooter />
  </div>
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar"
import TmPageHeader from "./TmPageHeader.vue"
import TmDataLoading from "common/TmDataLoading"
import TmDataEmpty from "common/TmDataEmpty"
import CardSignInRequired from "common/CardSignInRequired"
import { mapGetters } from "vuex"
import TmDataError from "common/TmDataError"
import TmDataConnecting from "common/TmDataConnecting"
import TmBalance from "common/TmBalance"
import ToolBar from "common/ToolBar"
import PageFooter from "common/TmPageFooter"

export default {
  name: `tm-page`,
  components: {
    TmBalance,
    ToolBar,
    TmPageHeader,
    TmDataEmpty,
    TmDataLoading,
    TmDataError,
    TmDataConnecting,
    CardSignInRequired,
    PageFooter
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
    managed: {
      type: Boolean,
      default: false
    },
    error: {
      type: Error,
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
    dataEmpty: {
      type: Boolean,
      default: undefined
    },
    notFound: {
      type: Boolean,
      default: undefined
    },
    refresh: {
      type: Function,
      default: undefined
    },
    signInRequired: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    perfectScrollbar: ``
  }),
  computed: {
    ...mapGetters([`session`, `connected`]),
    refreshable({ connected, refresh } = this) {
      return refresh ? { connected, refresh } : undefined
    }
  },
  watch: {
    $route() {
      this.scrollContainer.scrollTop = 0
    }
  },
  mounted() {
    this.scrollContainer = this.$el.querySelector(`.tm-page-main`)
    this.perfectScrollbar = new PerfectScrollbar(this.scrollContainer)
  }
}
</script>

<style>
.tm-page {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
}

.tm-page-main {
  flex: 1;
  position: relative;
  padding: 1rem;
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

.page-profile__section-title {
  margin: 0 0 0.25rem 1rem;
  color: var(--dim);
  font-size: var(--sm);
  font-weight: 500;
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
  margin: 1rem;
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
  display: flex;
  align-items: center;
}

.page-profile__status {
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  width: 0.5rem;
}

.page-profile__title {
  color: #fff;
  display: inline-block;
  font-size: var(--h1);
  font-weight: 400;
  padding: 0 0.5rem;
}

.page-profile__header__actions {
  display: flex;
  flex-direction: column;
}

.page-profile__header__actions button {
  margin-bottom: 0.5rem;
}

.page-profile__header__actions button:last-child {
  margin-bottom: 0;
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

.footer {
  width: 100%;
  background: var(--app-fg);
  padding: 0.5rem;
  margin-top: 1rem;
}

.app-menu-item-small {
  display: inline-block;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.25rem;
  margin: 0 0.5rem;
  color: var(--dim);
  border-radius: 0.25rem;
  font-size: var(--sm);
}

.link-list {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.link-list li {
  display: inline;
}

@media screen and (max-width: 767px) {
  .tm-page-main {
    padding: 1rem 0;
  }

  .row {
    flex-direction: column;
  }

  .page-profile__header__actions {
    margin-right: 0;
  }
}
</style>
