<template>
  <SessionFrame :icon="`verified_user`">
    <h2 class="session-title">Sign up for premium features!</h2>
    <p class="session-subtitle">
      We'll send a magic link to your email. Click it and you'll be signed in!
    </p>
    <TmField id="email" v-model="email" type="input" placeholder="Your email" />
    <TmFormMsg
      v-if="signInError"
      type="custom"
      :msg="account.signInError.message"
    />
    <div class="sign-in-buttons">
      <TmBtn
        value="Send Me A Magic Link"
        type="primary"
        @click.native="sendMagicLink()"
      />
    </div>
  </SessionFrame>
</template>
<script>
import SessionFrame from "common/SessionFrame"
import TmField from "src/components/common/TmField"
import TmFormMsg from "src/components/common/TmFormMsg"
import TmBtn from "common/TmBtn"
import { mapState } from "vuex"
export default {
  name: `sign-in-modal`,
  components: {
    SessionFrame,
    TmFormMsg,
    TmField,
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
      if (this.account.signInError) {
        this.signInError = true
      } else {
        this.$router.push({ name: `magic-link-sent-modal` })
      }
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
