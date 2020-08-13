<template>
  <SessionFrame :icon="`notifications`">
    <TmFormStruct :submit="sendMagicLink">
      <h2 class="session-title">Sign up to start recieving notifications!</h2>

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
        <TmFormMsg
          v-if="signInError"
          type="custom"
          :msg="
            account.signInEmailError
              ? account.signInEmailError.message
              : undefined
          "
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
import TmFormMsg from "src/components/common/TmFormMsg"
import TmBtn from "common/TmBtn"
import { mapState } from "vuex"
export default {
  name: `sign-in-modal`,
  components: {
    SessionFrame,
    TmFormMsg,
    TmField,
    TmFormStruct,
    TmBtn,
  },
  data: () => ({
    email: "",
    signInError: false,
  }),
  computed: {
    ...mapState([`account`]),
  },
  watch: {
    email: function () {
      this.signInError = false
    },
  },
  methods: {
    async sendMagicLink() {
      await this.$store.dispatch(`sendUserMagicLink`, {
        user: { email: this.email },
      })
      if (this.account.signInEmailError) {
        this.signInError = true
      } else {
        this.$router.push({ name: `magic-link-sent` })
      }
    },
  },
}
</script>
