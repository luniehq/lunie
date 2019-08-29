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
import TmPageHeader from "./TmPageHeader.vue"
import TmDataLoading from "common/TmDataLoading"
import TmDataEmpty from "common/TmDataEmpty"
import CardSignInRequired from "common/CardSignInRequired"
import { mapState, mapGetters } from "vuex"
import TmDataError from "common/TmDataError"
import TmDataConnecting from "common/TmDataConnecting"
import TmBalance from "common/TmBalance"
import PageFooter from "common/TmPageFooter"

export default {
  name: `tm-page`,
  components: {
    TmBalance,
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
      type: [Error, Boolean],
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
    signInRequired: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`connected`])
  },
  watch: {
    $route() {
      this.scrollContainer.scrollTop = 0
    }
  },
  mounted() {
    this.scrollContainer = this.$el.querySelector(`.tm-page-main`)
  }
}
</script>

<style scoped>
.tm-page {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.tm-page.small {
  max-width: 720px;
}

.tm-page-main {
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
  align-items: normal;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 0 1rem;
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

li {
  width: 100%;
  padding: 1rem;
  border-bottom: 1px solid var(--bc-dim);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

li:last-child {
  border-bottom: none;
}

h4 {
  color: var(--txt);
  font-size: var(--sm);
  margin-bottom: 2px;
  font-weight: 500;
}

.row span {
  color: var(--bright);
  font-size: var(--sm);
  font-weight: 400;
  line-height: 1rem;
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

@media screen and (min-width: 1024px) {
  .tm-page {
    margin: 1rem auto;
  }
}

@media screen and (max-width: 667px) {
  .row {
    flex-direction: column;
  }

  .page-profile__header__actions {
    margin-right: 0;
  }

  .tm-page {
    padding-bottom: 4rem;
  }
}
</style>
