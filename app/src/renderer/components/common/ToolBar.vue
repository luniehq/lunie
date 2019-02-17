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
      v-if="user.signedIn"
      id="settings"
      to="/preferences"
    >
      <i class="material-icons">settings</i>
    </router-link>
    <a
      v-tooltip.bottom.end="'Sign Out'"
      v-if="user.signedIn"
      id="signOut-btn"
      @click="signOut"
    >
      <i class="material-icons">exit_to_app</i>
    </a>
    <tm-btn
      v-if="!user.signedIn"
      id="signIn-btn"
      value="Sign In"
      color="primary"
      @click.native="signIn"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
export default {
  name: `tool-bar`,
  components: { TmBtn },
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
    signIn() {
      this.$store.commit(`setModalSessionState`, `welcome`)
      this.$store.commit(`setModalSession`, true)
    },
    signOut() {
      this.$store.dispatch(`signOut`)
      this.$router.push(`/`)
    }
  }
}
</script>
<style>
.tm-page-header-text {
  padding-right: 1rem;
}

.tool-bar {
  display: flex;
  align-items: center;
  height: fit-content;
}

.tool-bar a {
  padding: 0 0.5rem;
  color: var(--dim);
  display: flex;
  align-items: center;
}

.tool-bar a:hover {
  cursor: pointer;
  color: var(--bright);
}
</style>
