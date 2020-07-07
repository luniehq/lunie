<template>
  <SessionFrame :icon="`verified_user`">
    <TmFormStruct :submit="sendMagicLink">
      <h2 class="session-title">Sign up for premium features!</h2>

      <div class="session-main">
        <p class="session-subtitle">
          We'll send a magic link to your email. Click it and you'll be signed
          in!
        </p>

        <TmField
          id="email"
          v-model="email"
          type="input"
          placeholder="Your email"
        />
      </div>

      <div class="session-footer">
        <TmBtn value="Send Me A Magic Link" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>
<script>
import SessionFrame from "common/SessionFrame"
import TmField from "src/components/common/TmField"
import TmFormStruct from "src/components/common/TmFormStruct"
import TmBtn from "common/TmBtn"
export default {
  name: `sign-in-modal`,
  components: {
    SessionFrame,
    TmField,
    TmFormStruct,
    TmBtn,
  },
  data: () => ({
    email: "",
    errorOnAuthentication: false,
  }),
  methods: {
    async sendMagicLink() {
      await this.$store.dispatch(`sendUserMagicLink`, {
        user: { email: this.email },
      })
      this.$router.push({ name: `magic-link-sent` })
    },
    close() {
      this.$router.go(`-1`)
    },
  },
}
</script>
