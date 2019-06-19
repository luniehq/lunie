<template>
  <div class="session">
    <div class="session-container session-loading">
      <div class="session-header">
        <div class="session-title">
          Connecting to '{{ session.network }}'&hellip;
        </div>
      </div>
      <div class="session-main session-main--loading">
        <img src="~assets/images/loader.svg" /><br />{{ message }} &nbsp;
      </div>
      <div class="session-footer">
        &nbsp;
      </div>
    </div>
  </div>
</template>

<script>
import config from "src/config"

export default {
  name: `session-loading`,
  data: () => ({
    config,
    message: ``
  })
}
</script>
<style>
.session-loading .session-main {
  text-align: center;
}

.session-main--loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
