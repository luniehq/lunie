<template>
  <div class="tool-bar">
    <a
      v-tooltip.bottom="'Refresh'"
      v-if="!!refresh"
      :disabled="!refresh.connected"
      class="refresh-button"
      @click="refresh.connected && refresh.refresh()"
    >
      <i class="material-icons">refresh</i>
    </a>
    <a
      v-tooltip.bottom="'Search'"
      v-if="!!searching"
      :disabled="!searching.somethingToSearch"
      class="search-button"
      @click="searching.setSearch()"
    >
      <i class="material-icons">search</i>
    </a>
    <slot />
    <a v-tooltip.bottom="'Help'" class="help" @click="enableModalHelp">
      <i class="material-icons">help_outline</i>
    </a>
    <router-link
      v-tooltip.bottom="'Preferences'"
      v-if="config.devMode && user.signedIn"
      id="settings"
      to="/preferences"
    >
      <i class="material-icons">settings</i>
    </router-link>
    <a v-tooltip.bottom.end="'Sign Out'" id="signOut-btn" @click="signOut">
      <i class="material-icons">exit_to_app</i>
    </a>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
export default {
  name: `tool-bar`,
  props: {
    refresh: {
      type: Object,
      default: undefined
    },
    searching: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    ...mapGetters([`user`, `config`]),
    searchEnabled() {
      return !!this.searching
    },
    somethingToSearch() {
      return this.searching && this.searching.somethingToSearch()
    },
    setSearch() {
      return this.searching && this.searching.setSearch()
    }
  },
  methods: {
    enableModalHelp() {
      this.$store.commit(`setModalHelp`, true)
    },
    signOut() {
      this.$store.dispatch(`signOut`)
    }
  }
}
</script>
<style>
.tm-tool-bar {
  align-self: start;
}
.tm-page-header-text {
  padding-right: 1rem;
}

.tool-bar a {
  padding-left: 0.5rem;
  position: relative;
  top: 1rem;
  right: 1rem;
  color: var(--dim);
}

.tool-bar a:hover {
  cursor: pointer;
  color: var(--bright);
}
</style>
