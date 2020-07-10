<template>
  <div
    class="page"
    :class="{ 'dark-background': darkBackground && session.signedIn }"
  >
    <CardSignInRequired v-if="signInRequired && !session.signedIn" />
    <TmDataConnecting v-if="!connected" />
    <TmDataLoading v-else-if="loading" />
    <TmDataError v-else-if="error" />

    <slot></slot>
    <slot v-if="session.signedIn" name="signInRequired"></slot>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex"

import CardSignInRequired from "common/CardSignInRequired"
import TmDataConnecting from "common/TmDataConnecting"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"

export default {
  name: `tm-page`,
  components: {
    CardSignInRequired,
    TmDataConnecting,
    TmDataError,
    TmDataLoading,
  },
  props: {
    error: {
      type: Boolean,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
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
    this.scrollContainer = this.$el.querySelector(`.page`)
  },
}
</script>

<style scoped>
.page {
  position: relative;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.readable-width {
  max-width: 720px;
}

.page.dark-background {
  background: var(--app-fg);
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

@media screen and (min-width: 1024px) {
  .page {
    margin: 0 auto 2rem;
  }
}

@media screen and (max-width: 667px) {
  .page {
    padding-bottom: 4rem;
  }
}
</style>
