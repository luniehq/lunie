<template lang="pug">
#onboarding.tm-session-wrapper
  img.tm-session-backdrop(src="~assets/images/cosmos-logo.png")
  .tm-session: .tm-session-container
    .tm-session-header: .tm-session-title Welcome to Voyager
    .tm-session-main
      .tm-session-label {{ activeValue }}
      img(:src="activeImg")
      tm-bar-discrete(:nodes="nodes" :click-fn="go" :active="activeKey")
    .tm-session-footer(v-if="activeKey === nodes.length - 1")
      tm-btn(value="Restart" @click.native="go(0)" icon="settings_backup_restore")
      tm-btn(value="Finish" @click.native="finish" color="primary"
        icon="chevron_right" icon-pos="right" )
    .tm-session-footer(v-else)
      tm-btn(value="Skip" @click.native="finish" icon="close")
      tm-btn(value="Next" @click.native="next" color="primary"
        icon="chevron_right" icon-pos="right" )
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import { TmBarDiscrete, TmBtn } from "@tendermint/ui"
export default {
  name: "tm-onboarding",
  components: { TmBtn, TmBarDiscrete },
  computed: {
    ...mapGetters(["onboarding", "bondingDenom"]),
    activeKey() {
      return this.onboarding.state
    },
    nodes() {
      const nodes = [
        "This is a quick tour of the primary features of Cosmos Voyager.",
        "You can send and receive Cosmos tokens from anyone around the world.",
        `You can stake your ${
          this.bondingDenom
        } to Cosmos Validators to earn even more ${this.config.bondingDenom}.`,
        "Through governance, you can vote on the future of the Cosmos Network.",
        "Start using Voyager to explore the Cosmos Network!"
      ]
      return nodes
    },
    activeValue() {
      return this.nodes[this.onboarding.state]
    },
    activeImg() {
      return require(`../../assets/images/onboarding/step-${
        this.activeKey
      }.png`)
    },
    nodes() {
      return [
        "This is a quick tour of the primary features of Cosmos Voyager.",
        "You can send and receive Cosmos tokens from anyone around the world.",
        `You can stake your ${
          this.bondingDenom
        }s to Cosmos Validators to earn even more ${this.bondingDenom}s.`,
        "Through governance, you can vote on the future of the Cosmos Network.",
        "Start using Voyager to explore the Cosmos Network!"
      ]
    }
  },
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
    new PerfectScrollbar(this.$el.querySelector("#onboarding .tm-session-main"))
  }
}
</script>

<style lang="stylus">
@require '~variables'

#onboarding .tm-session-main
  position relative

.tm-bar-discrete__node--active
  border-color var(--tertiary) !important
</style>
