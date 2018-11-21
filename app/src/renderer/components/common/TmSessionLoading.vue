<template>
  <div class="tm-session">
    <div class="tm-session-container tm-session-loading">
      <div class="tm-session-header">
        <div class="tm-session-title">
          Connecting to '{{ config.default_network }}'&hellip;
        </div>
      </div>
      <div class="tm-session-main tm-session-main--loading">
        <img src="~assets/images/loader.svg" /><br />{{ message }} &nbsp
      </div>
      <div class="tm-session-footer">&nbsp;</div>
    </div>
  </div>
</template>

<script>
import { remote, ipcRenderer } from "electron"
const config = remote.getGlobal(`config`)
export default {
  name: `tm-session-loading`,
  data: () => ({
    config,
    message: ``
  }),
  mounted: function() {
    ipcRenderer.on(`connection-status`, (event, message) => {
      this.message = message
    })
  }
}
</script>
<style>
.tm-session-loading .tm-session-main {
  text-align: center;
}

.tm-session-main--loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
