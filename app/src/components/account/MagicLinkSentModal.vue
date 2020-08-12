<template>
  <SessionFrame :icon="`/img/icons/magic-wand.png`">
    <h2 class="session-title">Magic Link Sent</h2>
    <p class="session-subtitle">
      Check your email inbox for your magic link to confirm your email address
      and complete the sign up process.
    </p>
  </SessionFrame>
</template>
<script>
import SessionFrame from "common/SessionFrame"

export default {
  name: `magic-link-sent`,
  components: {
    SessionFrame,
  },
}
</script>
