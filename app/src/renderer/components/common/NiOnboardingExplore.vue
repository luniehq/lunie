<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title You can explore the cosmos
  .ni-session-main
    p With
    p Voyager!
  .ni-session-footer
    btn(value="Restart" @click.native="restart" icon="settings_backup_restore")
    btn(value="Finish" @click.native="finish" color="primary" icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-onboarding-stake",
  components: { Btn },
  computed: {
    ...mapGetters(["onboarding"])
  },
  methods: {
    restart(value) {
      this.$store.commit("setOnboardingState", "welcome")
    },
    finish(value) {
      this.$store.commit("setOnboardingActive", false)
      this.$store.commit("setOnboardingState", "welcome")
    }
  }
}
</script>
