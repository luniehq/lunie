<template>
  <div class="tm-tool-bar">
    <a
      class="back"
      @click="back"
      :disabled="user.history.length === 0"
      v-tooltip.bottom="'Back'"
      ><i class="material-icons">arrow_back</i></a
    >
    <slot></slot
    ><a class="help" @click="enableModalHelp" v-tooltip.bottom="'Help'"
      ><i class="material-icons">help_outline</i></a
    >
    <router-link
      id="settings"
      to="/preferences"
      v-tooltip.bottom="'Preferences'"
      ><i class="material-icons">settings</i></router-link
    ><a id="signOut-btn" @click="signOut" v-tooltip.bottom.end="'Sign Out'"
      ><i class="material-icons">exit_to_app</i></a
    >
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex"
export default {
  // the name needs to be different from TmToolBar (tm-tool-bar) or else recursive rendering takes place
  name: `vm-tool-bar`,
  computed: {
    ...mapGetters([`user`, `lastPage`])
  },
  methods: {
    ...mapMutations([`pauseHistory`, `popHistory`]),
    back() {
      if (!this.lastPage) return
      this.pauseHistory(true)
      this.$router.push(this.lastPage, () => {
        this.popHistory()
        this.pauseHistory(false)
      })
    },
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
.tm-page-header-text {
  padding-right: 1rem;
}

.tm-page-header-text i {
  padding: 1rem;
  color: var(--dim);
}

.tm-page-header-text i:hover {
  color: var(--bright);
}
</style>
