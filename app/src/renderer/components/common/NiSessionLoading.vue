<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Voyager is loading&hellip;
  .ni-session-main.ni-session-main--loading
    img(src="~assets/images/loader.svg")

</template>

<script>
export default { name: "ni-session-loading" }
</script>

<style lang="stylus">
.ni-session-main--loading
  display flex
  justify-content center
</style>
