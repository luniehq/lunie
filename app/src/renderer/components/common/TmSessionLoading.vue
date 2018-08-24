<template lang="pug">
.tm-session: .tm-session-container.tm-session-loading
  .tm-session-header
    .tm-session-title Connecting to '{{config.default_network}}'&hellip;
  .tm-session-main.tm-session-main--loading
    img(src="~assets/images/loader.svg")
    br
    | {{message}} &nbsp
  .tm-session-footer &nbsp;
</template>

<script>
import { remote, ipcRenderer } from "electron"
const config = remote.getGlobal("config")
export default {
  name: "tm-session-loading",
  data: () => ({
    config,
    message: ""
  }),
  mounted: function() {
    ipcRenderer.on("connection-status", (event, message) => {
      this.message = message
    })
  }
}
</script>
<style lang="stylus">
.tm-session-loading
  .tm-session-main
    text-align center

.tm-session-main--loading
  display flex
  flex-direction column
  justify-content center
</style>
