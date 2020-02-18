<template>
  <router-link
    :class="routerClass"
    :to="url"
    :exact="exact"
    :title="title"
    @click.native="handleClick()"
  >
    <slot></slot>
  </router-link>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: `routerLinkNetwork`,
  props: {
    routerClass: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    },
    exact: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapGetters([`networkSlug`]),
    url() {
      if (this.networkSlug) {
        return `/${this.networkSlug}${this.to}`
      }
      return this.to
    }
  },
  methods: {
    handleClick() {
      this.$emit(`click.native`)
    }
  }
}
</script>
