<template>
  <router-link
    :class="cclass"
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
    cclass: {
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
    ...mapGetters([`network`]),
    url() {
        console.log(this.to)
      if (this.network.length) {
        return `/${this.network}${this.to}`
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
