<template>
  <div class="tm-session-wrapper" id="onboarding">
    <img class="tm-session-backdrop" src="~assets/images/cosmos-logo.png" />
    <div class="tm-session">
      <div class="tm-session-container">
        <div class="tm-session-header">
          <div class="tm-session-title">Welcome to Voyager</div>
        </div>
        <div class="tm-session-main">
          <div class="tm-session-label">{{ activeValue }}</div>
          <img :src="activeImg" />
          <tm-bar-discrete
            :nodes="nodes"
            :click-fn="go"
            :active="activeKey"
          ></tm-bar-discrete>
        </div>
        <div class="tm-session-footer" v-if="activeKey === nodes.length - 1">
          <tm-btn
            value="Restart"
            @click.native="go(0)"
            icon="settings_backup_restore"
          ></tm-btn>
          <tm-btn
            value="Finish"
            @click.native="finish"
            color="primary"
            icon="chevron_right"
            icon-pos="right"
          ></tm-btn>
        </div>
        <div class="tm-session-footer" v-else="v-else">
          <tm-btn value="Skip" @click.native="finish" icon="close"></tm-btn>
          <tm-btn
            value="Next"
            @click.native="next"
            color="primary"
            icon="chevron_right"
            icon-pos="right"
          ></tm-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import { TmBarDiscrete, TmBtn } from "@tendermint/ui"
export default {
  name: `tm-onboarding`,
  components: { TmBtn, TmBarDiscrete },
  computed: {
    ...mapGetters([`onboarding`, `bondingDenom`]),
    activeKey() {
      return this.onboarding.state
    },
    nodes() {
      const nodes = [
        `This is a quick tour of the primary features of Cosmos Voyager.`,
        `You can send and receive Cosmos tokens from anyone around the world.`,
        `You can delegate your ${
          this.bondingDenom
        } to Cosmos Validators to earn even more ${this.bondingDenom}.`,
        `Through governance, you can vote on the future of the Cosmos Network.`,
        `Start using Voyager to explore the Cosmos Network!`
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
    }
  },
  mounted() {
    new PerfectScrollbar(this.$el.querySelector(`#onboarding .tm-session-main`))
  },
  methods: {
    go(state) {
      this.$store.commit(`setOnboardingState`, state)
    },
    next() {
      let nextState = this.onboarding.state + 1
      this.$store.commit(`setOnboardingState`, nextState)
    },
    restart() {
      this.$store.commit(`setOnboardingState`, 0)
    },
    finish() {
      this.$store.commit(`setOnboardingActive`, false)
      this.$store.commit(`setOnboardingState`, 0)
    }
  }
}
</script>

<style>
#onboarding .tm-session-main {
  position: relative;
}

#onboarding .tm-session-main position relative img height 300px
  .tm-session-footer justify-content center .tm-session-label padding 1rem 3rem
  .tm-bar-discrete__node--active border-color var(--tertiary)
  .tm-bar-discrete__node: hover border-color var(--link) !important !important;
</style>
