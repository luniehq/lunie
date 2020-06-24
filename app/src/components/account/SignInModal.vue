<template>
  <AccountFrame :icon="`verified_user`">
    <h2 class="account-title">Sign In / Sign Up</h2>
    <h4 class="account-subtitle">
      We will send you a magic link to your email
    </h4>

    <TmFormGroup field-id="sign-in-credentials">
      <TmField
        id="email"
        v-model="email"
        type="input"
        placeholder="Your email"
      />
    </TmFormGroup>
    <div class="sign-in-buttons">
      <TmBtn value="Cancel" type="secondary" @click.native="close()" />
      <TmBtn value="Send Link" type="primary" @click.native="sendMagicLink()" />
    </div>
  </AccountFrame>
</template>
<script>
import AccountFrame from "account/AccountFrame"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmBtn from "common/TmBtn"
export default {
  name: `sign-in-modal`,
  components: {
    AccountFrame,
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
      this.$router.push({ name: `magic-link-sent-modal` })
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

.sign-in-buttons button {
  width: 100%;
  height: 4rem;
}

.sign-in-buttons button:first-child {
  margin-right: 0.8rem;
}

.sign-in-buttons button:nth-child(2) {
  margin-left: 0.8rem;
}

#email {
  height: 3.5rem !important;
}

@media screen and (min-width: 667px) {
  .account {
    min-width: 460px;
  }
}
</style>
