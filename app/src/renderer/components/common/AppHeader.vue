<template>
  <nav id="app-header" :class="{ mobile: !desktop }">
    <div class="container">
      <div class="header-item header-item-logo">
        <router-link to="/">
          <img id="logo-white" src="~assets/images/cosmos-wordmark-white.svg">
        </router-link> 
      </div>
      <div v-if="session.experimentalMode" id="develop-mode-warning">
        EXPERIMENTAL MODE
      </div>
      <app-menu v-if="open || desktop" @close="close" />
      <template v-if="!desktop">
        <div v-if="open" class="header-item close-menu" @click="close()">
          <i class="material-icons">close</i>
        </div>
        <div v-if="!open" class="header-item open-menu" @click="show()">
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
  data: () => ({
    open: false,
    desktop: false
  }),
  computed: {
    ...mapGetters([`session`])
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

<style>
#app-header {
  z-index: var(--z-appHeader);
  position: relative;
}

#app-header .container {
  -webkit-app-region: drag;
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
