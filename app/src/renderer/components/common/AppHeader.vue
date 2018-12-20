<template>
  <nav id="app-header" :class="{ mobile: !config.desktop, windows: isWin }">
    <div class="container">
      <template v-if="!config.desktop">
        <div class="header-item" />
      </template>
      <div class="header-item header-item-logo">
        <img
          v-if="themes.active == 'light'"
          id="logo-black"
          src="~assets/images/cosmos-wordmark-black.svg"
        /><img
          v-else
          id="logo-white"
          src="~assets/images/cosmos-wordmark-white.svg"
        />
      </div>
      <app-menu v-if="config.activeMenu === 'app' || config.desktop" /><template
        v-if="!config.desktop"
      >
        <div
          v-if="config.activeMenu === 'app'"
          class="header-item"
          @click="close"
        >
          <i class="material-icons">close</i>
        </div>
        <div v-else class="header-item" @click="enableMenu()">
          <i class="material-icons">menu</i>
        </div>
      </template>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from "vuex"
import noScroll from "no-scroll"
import AppMenu from "common/AppMenu"
export default {
  name: `app-header`,
  components: { AppMenu },
  computed: {
    ...mapGetters([`config`, `themes`]),
    isWin() {
      return navigator.platform.toUpperCase().indexOf(`WIN`) >= 0
    }
  },
  mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  },
  methods: {
    close() {
      this.$store.commit(`setActiveMenu`, ``)
      noScroll.off()
    },
    enableMenu() {
      this.$store.commit(`setActiveMenu`, `app`)
      noScroll.on()
    },
    watchWindowSize() {
      let w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )

      if (w >= 1024) {
        this.close()
        this.$store.commit(`setConfigDesktop`, true)
        return
      } else {
        this.$store.commit(`setConfigDesktop`, false)
      }
    }
  }
}
</script>

<style>
#app-header {
  z-index: var(--z-appHeader);
}

#app-header .container {
  -webkit-app-region: drag;
}

#app-header.windows:before {
  display: block;
  content: "";
  height: var(--px);
  background: var(--bc);
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  z-index: var(--z-appHeader);
}

@media screen and (max-width: 1023px) {
  #app-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: var(--app-bg);
  }

  #app-header > .container {
    max-width: var(--aw);
    margin: 0 auto;
    display: flex;
    flex-flow: row nowrap;
    border-bottom: var(--px) solid var(--bc);
    justify-content: space-between;
  }

  #app-header .header-item {
    height: calc(3rem - var(--px));
    width: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    color: var(--link);
    cursor: pointer;
  }

  #app-header .header-item i.material-icons {
    width: 1rem;
    font-size: var(--lg);
  }

  #app-header .header-item.header-item-logo img {
    height: 1.5rem;
  }
}

@media screen and (min-width: 1024px) {
  #app-header {
    display: flex;
    flex: 0 0 var(--width-side);
    min-width: 0;
    display: flex;
  }

  #app-header > .container {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
  }

  #app-header .header-item-logo {
    border-bottom: var(--px) solid var(--bc);
    padding: 2.5rem 1rem 1rem 1rem;
    line-height: normal;
  }

  #app-header .header-item-logo img {
    height: 1.75rem;
  }
}
</style>
