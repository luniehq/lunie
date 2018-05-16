<template lang="pug">
#onboarding.ni-session-wrapper
  img.ni-session-backdrop(src="~assets/images/cosmos-logo.png")
  .ni-session: .ni-session-container
    .ni-session-header: .ni-session-title Welcome to Voyager
    .ni-session-main
      .ni-session-label {{ activeValue }}
      img(:src="activeImg")
      bar-discrete(:nodes="nodes" :click-fn="go" :active="activeKey")
    .ni-session-footer(v-if="activeKey === nodes.length - 1")
      btn(value="Restart" @click.native="go(0)" icon="settings_backup_restore")
      btn(value="Finish" @click.native="finish" color="primary"
        icon="chevron_right" icon-pos="right" )
    .ni-session-footer(v-else)
      btn(value="Skip" @click.native="finish" icon="close")
      btn(value="Next" @click.native="next" color="primary"
        icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import Btn from "@nylira/vue-button"
import BarDiscrete from "common/NiBarDiscrete"
export default {
  name: "ni-onboarding",
  components: { Btn, BarDiscrete },
  computed: {
    ...mapGetters(["onboarding"]),
    activeKey() {
      return this.onboarding.state
    },
    activeValue() {
      return this.nodes[this.onboarding.state]
    },
    activeImg() {
      return require(`../../assets/images/onboarding/step-${
        this.activeKey
      }.png`)
    }
  },
  data: () => ({
    nodes: [
      "This is a quick tour of the primary features of Cosmos Voyager.",
      "You can send and receive Cosmos tokens from anyone around the world.",
      "You can stake your Atoms to Cosmos Validators to earn even more Atoms.",
      "Through governance, you can vote on the future of the Cosmos Network.",
      "Start using Voyager to explore the Cosmos Network!"
    ]
  }),
  methods: {
    go(state) {
      this.$store.commit("setOnboardingState", state)
    },
    next() {
      let nextState = this.onboarding.state + 1
      this.$store.commit("setOnboardingState", nextState)
    },
    restart() {
      this.$store.commit("setOnboardingState", 0)
    },
    finish() {
      this.$store.commit("setOnboardingActive", false)
      this.$store.commit("setOnboardingState", 0)
    }
  },
  mounted() {
    new PerfectScrollbar(this.$el.querySelector("#onboarding .ni-session-main"))
  }
}
</script>

<style lang="stylus">
@require '~variables'

#onboarding .ni-session-main
  position relative
</style>
