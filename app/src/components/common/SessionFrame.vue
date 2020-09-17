<template>
  <transition name="component-fade" mode="out-in">
    <div
      v-focus-last
      class="session-frame"
      tabindex="0"
      @keyup.esc="closeModal()"
    >
      <div class="session-outer-container">
        <div
          v-if="
            (icon.startsWith(`/img`) || icon.startsWith(`https`)) &&
            !isExtension
          "
          class="icon-circle"
        >
          <img class="icon-image" :src="icon" />
        </div>
        <i
          v-else-if="icon.length > 0 && !isExtension"
          class="material-icons notranslate circle modal-icon"
          >{{ icon }}</i
        >
        <div class="session">
          <div class="session-header">
            <a :class="{ invisible: hideBack }" @click="goBack">
              <i class="material-icons notranslate circle back">arrow_back</i>
            </a>
            <div v-if="!isExtension" class="session-close">
              <a @click="closeModal()">
                <i class="material-icons notranslate circle back">close</i>
              </a>
            </div>
          </div>
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import config from "src/../config"
import { mapState, mapGetters } from "vuex"

export default {
  name: `session-frame`,
  components: {},
  props: {
    hideBack: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: ``,
    },
  },
  data: () => ({
    isExtension: config.isExtension,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`networkSlug`]),
  },
  methods: {
    goBack() {
      try {
        this.$router.go(`-1`)
      } catch (error) {
        this.$router.push({
          name: "networks",
        })
      }
    },
    closeModal() {
      if (this.$route.meta.requiresAuth) {
        this.$router.push({
          name: "validators",
          params: {
            networkId: this.networkSlug,
          },
        })
      } else {
        // if user is signed in with address
        if (this.session.address) {
          this.$router.push({
            name: `portfolio`,
          })
          // if user is not signed in with address
        } else {
          this.$router.push({
            name: `validators`,
          })
        }
      }
    },
  },
}
</script>

<style>
@import "../../styles/session.css";

.invisible {
  visibility: hidden;
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}

.component-fade-enter,
.component-fade-leave-to .component-fade-leave-active {
  opacity: 0;
}

.icon-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--app-fg);
  color: var(--dim);
  border-radius: 50%;
  padding: 2.5rem;
  position: absolute;
  top: 0.6rem;
  left: 40%;
  z-index: 1;
  width: 4rem;
  height: 4rem;
}

.icon-image {
  width: 2rem;
  height: 2rem;
  transform: scaleX(-1);
  filter: invert(85%) sepia(9%) saturate(18%) hue-rotate(6deg) brightness(85%)
    contrast(87%); /* converts to same than var(--dim) */
}
</style>
