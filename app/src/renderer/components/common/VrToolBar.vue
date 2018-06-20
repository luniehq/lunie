<template lang="pug">
  tm-tool-bar
    slot
    a.back(@click="$router.go(-1)" v-tooltip.bottom="'Back'")
      i.material-icons arrow_back
    a.help(@click="enableModalHelp" v-tooltip.bottom="'Help'")
      i.material-icons help_outline
    a.sign-out(@click="signOut" v-tooltip.bottom.end="'Sign Out'")
      i.material-icons exit_to_app
</template>

<script>
import { TmToolBar } from "@tendermint/ui"
export default {
  name: "vr-tool-bar",
  components: {
    TmToolBar
  },
  methods: {
    enableModalHelp() {
      this.$store.commit("setModalHelp", true)
    },
    signOut() {
      this.$store.dispatch("signOut")
    }
  }
}
</script>
