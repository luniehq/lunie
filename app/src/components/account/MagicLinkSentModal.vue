<template>
  <AccountFrame :icon="`/img/icons/magic-wand.png`">
    <h2 class="account-title">Magic Link Sent</h2>
    <h4 class="account-subtitle">
      Check your inbox for the magic link to confirm your email address
    </h4>
  </AccountFrame>
</template>
<script>
import AccountFrame from "account/AccountFrame"
export default {
  name: `magic-link-sent-modal`,
  components: {
    AccountFrame,
  },
  data: () => ({
    email: "",
    errorOnAuthentication: false,
  }),
}
</script>
