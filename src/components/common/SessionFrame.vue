<template>
  <div class="session-header">
    <slot name="image"></slot>
    <a v-if="displayBack" @click="goBack">
      <i class="material-icons session-back">arrow_back</i>
    </a>
    <h2 class="session-title">
      <slot name="title"></slot>
    </h2>
    <p class="session-paragraph">
      <slot name="paragraph"></slot>
    </p>
    <a @click="close">
      <i class="material-icons session-close">close</i>
    </a>
  </div>
</template>

<script>
export default {
  name: `session-frame`,
  props: {
    previousRoute: {
      type: String,
      default: "welcome"
    },
    displayBack: {
      type: Boolean,
      default: true
    },
    nestedBack: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    setState(value) {
      this.$parent.$parent.$emit(`route-change`, value)
    },
    close() {
      this.$parent.$parent.$emit(`close`)
    },
    goBack() {
      let shortenedKey = this.$parent
      if (this.nestedBack) {
        shortenedKey = this.$parent.$parent
      }
      shortenedKey.$emit(`route-change`, this.previousRoute)
    }
  }
}
</script>
