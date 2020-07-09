<template>
  <div
    class="page"
    :class="{ 'dark-background': darkBackground && session.signedIn }"
  >
    <CardSignInRequired v-if="signInRequired && !session.signedIn" />
    <template v-else-if="managed">
      <TmDataConnecting v-if="!connected" />
      <TmDataLoading v-else-if="loading" />
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
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"

import TmDataLoading from "common/TmDataLoading"
import TmDataEmpty from "common/TmDataEmpty"
import CardSignInRequired from "common/CardSignInRequired"
import TmDataError from "common/TmDataError"
import TmDataConnecting from "common/TmDataConnecting"

export default {
  name: `tm-page`,
  components: {
    TmDataEmpty,
    TmDataLoading,
    TmDataError,
    TmDataConnecting,
    CardSignInRequired,
  },
  props: {
    hideHeader: {
      type: Boolean,
      default: false,
    },
    managed: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: undefined,
    },
    tabs: {
      type: Array,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loaded: {
      type: Boolean,
      default: undefined,
    },
    dataEmpty: {
      type: Boolean,
      default: undefined,
    },
    signInRequired: {
      type: Boolean,
      default: false,
    },
    darkBackground: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`connected`]),
  },
  watch: {
    $route() {
      this.scrollContainer.scrollTop = 0
    },
  },
  mounted() {
    this.scrollContainer = this.$el.querySelector(`.tm-page-main`)
  },
}
</script>

<style scoped>
.tm-page {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tm-page.small {
  max-width: 720px;
}

.tm-page-main {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 3rem;
}

.tm-page-main.dark-background {
  background: var(--app-fg);
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
    margin: 1rem auto 0;
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
