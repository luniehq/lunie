<template>
  <nav class="app-header" :class="{ mobile: !desktop }">
    <div class="container">
      <div class="header-item" :class="{ open: open }">
        <router-link to="/">
          <img
            class="header-item-logo"
            src="~assets/images/lunie-logo-white.svg"
            alt="Lunie spaceship accelerating into a colourful space sky"
          />
          Lunie
        </router-link>
        <template v-if="!desktop">
          <div v-if="open" class="close-menu" @click="close()">
            <i class="material-icons mobile-menu-action">close</i>
          </div>
          <div v-if="!open" class="open-menu" @click="show()">
            <i class="material-icons mobile-menu-action">more_vert</i>
          </div>
        </template>
      </div>
      <AppMenu v-if="open || desktop" @close="close" />
    </div>
  </nav>
</template>

<script>
import { mapState } from "vuex"
import noScroll from "no-scroll"
import AppMenu from "common/AppMenu"
export default {
  name: `app-header`,
  components: { AppMenu },
  data: () => ({
    open: false,
    desktop: false
  }),
  computed: {
    ...mapState([`session`])
  },
  mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  updated() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  methods: {
    close() {
      this.open = false
      noScroll.off()
    },
    show() {
      this.open = true
      noScroll.on()
    },
    watchWindowSize() {
      const w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )

      if (w >= 1024) {
        this.close()
        this.desktop = true
        return
      } else {
        this.desktop = false
      }
    }
  }
}
</script>

<style scoped>
.app-header {
  z-index: var(--z-appHeader);
  position: relative;
  background: var(--app-nav);
  min-height: 100vh;
  width: var(--width-side);
}

.app-header .header-item.open {
  background: var(--app-nav);
}

.mobile-menu-action {
  font-size: 1.5rem !important;
}

.app-header > .container {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
}

.app-header .header-item {
  padding: 1.25rem;
  font-size: 0;
}

.app-header .header-item a {
  display: inline-block;
}

.header-item-logo {
  height: 3rem;
}

@media screen and (max-width: 1023px) {
  .app-header {
    width: 100%;
    min-height: 0;
  }

  .container {
    background: var(--app-fg-dark);
    position: fixed;
    width: 100%;
  }

  .app-header .header-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    color: var(--link);
    cursor: pointer;
  }

  .header-item-logo {
    height: 2rem;
    padding-left: 4px;
  }
}

@media screen and (min-width: 1024px) {
  .app-header > .container {
    position: fixed;
  }
}
</style>
