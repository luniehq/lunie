<template>
  <div
    class="page"
    :class="{ 'dark-background': darkBackground && session.signedIn }"
  >
    <CardSignInRequired v-if="signInRequired && !session.signedIn" />
    <template>
      <TmDataConnecting v-if="!connected" />
      <TmDataLoading v-else-if="loading" />
      <TmDataError v-else-if="error" />
    </template>

    <slot />
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

.page.small {
  max-width: 720px;
}

.page.dark-background {
  background: var(--app-fg);
}

@media screen and (min-width: 1024px) {
  .page {
    margin: 1rem auto 0;
  }
}

@media screen and (max-width: 667px) {
  .page {
    padding-bottom: 4rem;
  }
}
</style>
