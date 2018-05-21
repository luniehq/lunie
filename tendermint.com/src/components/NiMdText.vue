<template lang="pug">
.ni-md-text(v-html="markdown(text)")
</template>

<script>
import MarkdownIt from "markdown-it"
export default {
  name: "ni-md-text",
  data: () => ({
    text: "## Loading..."
  }),
  methods: {
    markdown(text) {
      let md = new MarkdownIt()
      return md.render(text)
    }
  },
  mounted() {
    window
      .fetch(this.url)
      .then(response => response.text())
      .then(text => (this.text = text))
  },
  props: ["url"]
}
</script>

<style lang="stylus">
.ni-md-text
  h1:first-child
    display none
  h2:nth-child(2)
    margin-top 0
</style>
