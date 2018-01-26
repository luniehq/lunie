<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Loading&hellip;
  .ni-session-main &nbsp
  .ni-session-footer &nbsp;
  notifications(:notifications='notifications' theme='cosmos')
</template>

<script>
export default {
  name: 'ni-session-loading'
}
</script>
