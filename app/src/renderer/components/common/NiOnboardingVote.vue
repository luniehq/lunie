<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title You can vote
  .ni-session-main
    p Option 1
    p Option 2
    p Option 3
  .ni-session-footer
    btn(value="Skip" @click.native="skip" icon="close")
    btn(value="Next" @click.native="next('explore')" color="primary" icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
export default {
  name: "ni-onboarding-vote",
  components: { Btn },
  computed: {
    ...mapGetters(["onboarding"])
  },
  methods: {
    skip(value) {
      this.$store.commit("setOnboardingActive", false)
    },
    next(value) {
      this.$store.commit("setOnboardingState", value)
    }
  }
}
</script>
