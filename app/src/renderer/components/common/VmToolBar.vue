<template lang="pug">
  tm-tool-bar
    slot
    a.back(@click="back" :disabled="user.history.length === 0" v-tooltip.bottom="'Back'")
      i.material-icons arrow_back
    a.help(@click="enableModalHelp" v-tooltip.bottom="'Help'")
      i.material-icons help_outline
    a#signOut-btn(@click="signOut" v-tooltip.bottom.end="'Sign Out'")
      i.material-icons exit_to_app
</template>

<script>
import { TmToolBar } from "@tendermint/ui"
import { mapGetters, mapMutations } from "vuex"
export default {
  // the name needs to be different from TmToolBar (tm-tool-bar) or else recursive rendering takes place
  name: "vm-tool-bar",
  components: {
    TmToolBar
  },
  methods: {
    ...mapMutations(["pauseHistory", "popHistory"]),
    back() {
      if (!this.lastPage) return
      this.pauseHistory(true)
      this.$router.push(this.lastPage, () => {
        this.popHistory()
        this.pauseHistory(false)
      })
    },
    enableModalHelp() {
      this.$store.commit("setModalHelp", true)
    },
    signOut() {
      this.$store.dispatch("signOut")
    }
  },
  computed: {
    ...mapGetters(["user", "lastPage"])
  }
}
</script>
