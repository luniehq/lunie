<template>
  <nav
    class="app-header"
    :class="{ mobile: !desktop, hideSidebarMenu: hideSidebarMenu }"
  >
    <div v-show="!hideSidebarMenu" class="container" :class="{ open: open }">
      <div class="header-item" :class="{ open: open }">
        <a v-if="!isMobileApp" href="https://lunie.io">
          <svg
            class="header-item-logo"
            width="324"
            height="100"
            viewBox="0 0 324 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M99.6566 52.2694C99.6566 77.127 80.4508 97.7109 55.7942 99.5268C52.6437 99.7588 49.9016 97.3929 49.6695 94.2423C49.4375 91.0918 51.8034 88.3497 54.954 88.1177C73.6452 86.7411 88.2166 71.1242 88.2166 52.2694C88.2166 33.4303 73.6686 17.8213 54.9959 16.4243C51.8456 16.1886 49.4829 13.4438 49.7185 10.2935C49.9542 7.14327 52.6991 4.78053 55.8493 5.01621C80.4816 6.859 99.6566 27.4324 99.6566 52.2694ZM33.8699 20.1512C37.758 20.1512 40.9099 16.9993 40.9099 13.1112C40.9099 9.22312 37.758 6.0712 33.8699 6.0712C29.9818 6.0712 26.8299 9.22312 26.8299 13.1112C26.8299 16.9993 29.9818 20.1512 33.8699 20.1512ZM22.3632 27.778C22.3632 31.666 19.2113 34.818 15.3232 34.818C11.4351 34.818 8.2832 31.666 8.2832 27.778C8.2832 23.8899 11.4351 20.738 15.3232 20.738C19.2113 20.738 22.3632 23.8899 22.3632 27.778ZM7.04 57.8707C10.9281 57.8707 14.08 54.7188 14.08 50.8307C14.08 46.9426 10.9281 43.7907 7.04 43.7907C3.15192 43.7907 0 46.9426 0 50.8307C0 54.7188 3.15192 57.8707 7.04 57.8707ZM22.3632 75.6579C22.3632 79.546 19.2113 82.6979 15.3232 82.6979C11.4351 82.6979 8.2832 79.546 8.2832 75.6579C8.2832 71.7698 11.4351 68.6179 15.3232 68.6179C19.2113 68.6179 22.3632 71.7698 22.3632 75.6579ZM40.9099 90.3246C40.9099 94.2126 37.758 97.3646 33.8699 97.3646C29.9818 97.3646 26.8299 94.2126 26.8299 90.3246C26.8299 86.4365 29.9818 83.2846 33.8699 83.2846C37.758 83.2846 40.9099 86.4365 40.9099 90.3246Z"
            />
            <path
              d="M172.268 76.238V67.4155H147.158V27.8495H137.656V76.238H172.268Z"
            />
            <path
              d="M205.772 76.238H213.713V37.2151H204.211V57.0998C204.211 64.2257 201.022 69.0442 194.846 69.0442C188.331 69.0442 186.159 64.8365 186.159 58.3893V37.2151H176.726V60.8324C176.726 70.8766 181.612 77.1203 191.453 77.1203C198.239 77.1203 202.786 73.7949 204.89 68.5692L205.772 76.238Z"
            />
            <path
              d="M231.218 56.489C231.218 48.888 234.476 44.2053 241.534 44.2053C248.321 44.2053 250.56 48.413 250.56 55.0638V76.238H260.061V52.7564C260.061 42.6443 254.632 36.1971 244.656 36.1971C237.598 36.1971 232.847 39.7261 230.608 45.1554L229.725 37.2151H221.717V76.238H231.218V56.489Z"
            />
            <path
              d="M271.775 32.668C275.914 32.668 278.018 30.9035 278.018 26.5601C278.018 22.0809 275.847 20.52 271.775 20.52C267.771 20.52 265.599 22.0809 265.599 26.5601C265.599 31.1071 267.295 32.668 271.775 32.668ZM276.457 76.238V37.2151H266.888V76.238H276.457Z"
            />
            <path
              d="M303.231 43.5945C309.882 43.5945 313.411 46.9878 314.158 52.96H291.355C292.372 46.9878 296.512 43.5945 303.231 43.5945ZM322.98 64.7008H312.8C311.307 67.8905 308.321 69.655 303.163 69.655C296.037 69.655 292.101 66.3296 291.287 60.2216H323.523V56.0818C323.523 45.4947 317.076 36.1971 303.095 36.1971C289.929 36.1971 281.989 44.5446 281.989 56.8283V57.5749C281.989 69.5872 288.504 77.3239 302.688 77.3239C313.411 77.3239 320.265 72.9126 322.98 64.7008Z"
            />
          </svg>
          Lunie
        </a>
        <router-link
          v-else
          :to="{ name: 'portfolio', params: { networkId: networkSlug } }"
          exact="exact"
          title="Portfolio"
        >
          <img
            class="header-item-logo"
            src="~assets/images/lunie-logo-white.svg"
            alt="Lunie sharing circle - dots on the left outline of the cirle, line on the right side"
          />
        </router-link>
        <div class="header-menu-section">
          <template v-if="!desktop">
            <UserMenu v-if="isMobileApp" />
            <div v-if="open" class="close-menu" @click="close()">
              <i class="material-icons notranslate mobile-menu-action">close</i>
            </div>
            <div v-if="!open" class="open-menu" @click="show()">
              <i class="material-icons notranslate mobile-menu-action"
                >more_vert</i
              >
            </div>
          </template>
        </div>
      </div>
      <AppMenu v-if="open || desktop" @close="close" />
    </div>
  </nav>
</template>

<script>
import { mapState } from "vuex"
import AppMenu from "common/AppMenu"
import UserMenu from "account/UserMenu"
export default {
  name: `app-header`,
  components: { AppMenu, UserMenu },
  data: () => ({
    open: false,
    desktop: false,
  }),
  computed: {
    ...mapState([`session`, `connection`]),
    networkSlug() {
      return this.connection.networkSlug
    },
    isMobileApp() {
      return this.session.mobile
    },
    hideSidebarMenu() {
      return !this.$route.meta.networkSpecificRoute && this.desktop
    },
  },
  mounted: async function () {
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
    },
    show() {
      if (this.session.currrentModalOpen) {
        this.session.currrentModalOpen.close()
      }
      this.open = true
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
    },
  },
}
</script>

<style scoped>
.app-header {
  z-index: var(--z-appHeader);
  position: relative;
  width: var(--sidebar-plus-width);
  display: flex;
  flex-direction: row;
}

.app-header.hideSidebarMenu {
  width: 4rem;
}

.container {
  display: flex;
  flex-direction: row;
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
  padding-top: 1.4rem;
}

@media screen and (max-width: 1023px) {
  .app-header > .container.open {
    height: 100%;
    overflow: auto;
  }

  .app-header > .container {
    position: fixed;
    top: 0;
  }
}

.header-item-logo {
  height: 2rem;
  width: 6.5rem;
  fill: var(--menu-bright);
}

.header-menu-section {
  display: flex;
  align-items: center;
}

.header-menu-section > * {
  padding: 0 0.5rem;
}

.mobile-menu-action,
.header-menu-section a {
  color: var(--menu-bright);
}

.app-header .header-item {
  padding: 1.75rem;
  font-size: 0;
}

.app-header .header-item a {
  display: inline-block;
}

@media screen and (max-width: 1023px) {
  .app-header {
    width: 100%;
    min-height: 0;
  }

  .container {
    background: var(--app-nav);
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
    height: 1.75rem;
  }
}

@media screen and (min-width: 1024px) {
  .app-header > .container {
    position: fixed;
    height: 100%;
    overflow: auto;
    background: var(--app-nav);
    left: 4rem;
  }
}

/* iPhone X and Xs Max */
@media only screen and (min-device-width: 375px) and (min-device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) {
  .app-header > .container {
    padding-top: 2.2rem;
  }
}

/* iPhone XR */
@media only screen and (min-device-width: 414px) and (min-device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait) {
  .app-header > .container {
    padding-top: 2.2rem;
  }
}
</style>
