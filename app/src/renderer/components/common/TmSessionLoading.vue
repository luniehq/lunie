<template lang="pug">
.tm-session: .tm-session-container
  .tm-session-header
    .tm-session-title Connecting to '{{config.default_network}}'&hellip;
  .tm-session-main {{message}} &nbsp
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
.tm-session-main
  text-align center
</style>
