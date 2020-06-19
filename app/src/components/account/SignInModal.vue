<template>
  <SessionFrame>
    <h2 class="session-title">Sign In/ Sign Up</h2>
    <TmFormGroup
      field-id="sign-in-credentials"
      field-label="We will send you a magic link to your email"
    >
      <TmField
        id="email"
        v-model="email"
        type="input"
        placeholder="Your email"
      />
    </TmFormGroup>
    <div class="sign-in-buttons">
      <TmBtn value="Cancel" type="secondary" @click.native="close()" />
      <TmBtn value="Sign In" type="primary" @click.native="sendMagicLink()" />
    </div>
  </SessionFrame>
</template>
<script>
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmBtn from "common/TmBtn"
export default {
  name: `sign-in-modal`,
  components: {
    SessionFrame,
    TmFormGroup,
    TmField,
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
    },
    close() {
      this.$router.go(`-1`)
    },
  },
}
</script>
<style scoped>
.sign-in-buttons {
  display: flex;
  justify-content: space-evenly;
  margin-top: 1.5em;
}

@media screen and (min-width: 667px) {
  .session {
    min-width: 450px;
  }
}
</style>
