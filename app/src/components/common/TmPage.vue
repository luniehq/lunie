<template>
  <div class="page">
    <CardSignInRequired v-if="signInRequired && !session.signedIn" />

    <TmDataLoading v-else-if="loading && !loaderPath" />
    <template v-if="loading && loaderPath" class="loading-image-container">
      <img
        class="loading-image"
        :src="loaderPath"
        alt="geometric placeholder loading shapes"
      />
    </template>

    <TmDataMsg
      v-else-if="!loading && empty"
      icon="error"
      icon-color="var(--dark-grey-blue)"
      :title="emptyTitle"
      :subtitle="emptySubtitle"
    />

    <template v-else-if="!loading && !empty">
      <slot></slot>
      <TmDataLoading v-if="!loading && loadingMore" />
    </template>
    <slot v-if="session.signedIn" name="signInRequired"></slot>
  </div>
</template>

<script>
import { mapState } from "vuex"
import CardSignInRequired from "common/CardSignInRequired"
import TmDataLoading from "common/TmDataLoading"
import TmDataMsg from "common/TmDataMsg"

export default {
  name: `tm-page`,
  components: {
    CardSignInRequired,
    TmDataLoading,
    TmDataMsg,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    loadingMore: {
      type: Boolean,
      default: false,
    },
    loaderPath: {
      type: String,
      default: ``,
    },
    empty: {
      type: Boolean,
      default: false,
    },
    emptyTitle: {
      type: String,
      default: `No data`,
    },
    emptySubtitle: {
      type: String,
      default: ``,
    },
    signInRequired: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState([`session`]),
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
  padding: 1rem 0 0;
}

.loading-image-container {
  padding: 2em;
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

@media screen and (max-width: 1024px) {
  .page {
    margin: 0 auto 6rem;
  }
}

@media screen and (max-width: 667px) {
  .page {
    padding-bottom: 4rem;
  }
}
</style>
