<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="svg" />
</template>

<script>
import Avatars from "@dicebear/avatars"
import regularSprites from "@dicebear/avatars-jdenticon-sprites"
import humanSprites from "@dicebear/avatars-human-sprites"

export default {
  name: `avatar`,
  props: {
    address: {
      type: String,
      required: true,
    },
    human: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    svg() {
      let sprites = this.human ? humanSprites : regularSprites
      const options = { mood: [`happy`] }
      const avatars = new Avatars(sprites, options)
      return avatars.create(this.address)
    },
  },
}
</script>
