<template>
  <div id="onboarding" class="tm-session-wrapper">
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
            :active="parseInt(activeKey)"
          />
        </div>
        <div v-if="activeKey === nodes.length - 1" class="tm-session-footer">
          <tm-btn
            value="Restart"
            icon="settings_backup_restore"
            @click.native="go(0)"
          />
          <tm-btn
            value="Finish"
            color="primary"
            icon="chevron_right"
            icon-pos="right"
            @click.native="finish"
          />
        </div>
        <div v-else class="tm-session-footer">
          <tm-btn value="Skip" icon="close" @click.native="finish" />
          <tm-btn
            value="Next"
            color="primary"
            icon="chevron_right"
            icon-pos="right"
            @click.native="next"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import TmBarDiscrete from "common/TmBarDiscrete"
import TmBtn from "common/TmBtn"
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
#onboarding .tm-session-main img {
  height: 300px;
}
#onboarding .tm-session-main .tm-session-footer {
  justify-content: center;
}
#onboarding .tm-session-main .tm-bar-discrete__node--active {
  border-color: var(--tertiary);
}
#onboarding .tm-session-main .tm-bar-discrete__node:hover {
  border-color: var(--link) !important;
}
</style>
