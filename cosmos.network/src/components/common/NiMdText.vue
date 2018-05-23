<template lang="pug">
.ni-md-text(v-html="markdown(text)")
</template>

<script>
import { Base64 } from "js-base64"
import MarkdownIt from "markdown-it"
import axios from "axios"
export default {
  name: "ni-md-text",
  data: () => ({
    text: "## Loading...\nLoading..."
  }),
  methods: {
    markdown(text) {
      let md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      })
      return md.render(text)
    }
  },
  async mounted() {
    let data = (await axios.get(this.url)).data
    this.text = Base64.decode(data.content)
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
