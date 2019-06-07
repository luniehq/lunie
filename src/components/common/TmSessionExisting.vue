<template>
  <div class="session">
    <div class="session-header">
      <a @click="goToWelcome()">
        <i class="material-icons session-back">arrow_back</i>
      </a>
      <h2 class="session-title">
        Use an existing address
      </h2>
      <a @click="$store.commit(`toggleSessionModal`, false)">
        <i class="material-icons session-close">close</i>
      </a>
    </div>

    <div class="session-list">
      <LiSession
        icon="language"
        title="Explore with any address"
        @click.native="() => setState('explore')"
      />
      <LiSession
        icon="vpn_key"
        title="Use my Ledger Nano"
        @click.native="() => setState('hardware')"
      />
      <LiSession
        icon="settings_backup_restore"
        title="Recover from seed"
        @click.native="() => setState('import')"
      />
      <LiSession
        v-if="accountExists"
        id="sign-in-with-account"
        icon="lock"
        title="Sign in with account"
        @click.native="setState('sign-in')"
      />
    </div>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import LiSession from "common/TmLiSession"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
export default {
  name: `session-existing`,
  components: {
    LiSession,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  computed: {
    ...mapGetters([`session`]),
    accountExists() {
      return this.session.accounts.length > 0
    }
  },
  data: () => ({
    address: ``,
    error: ``
  }),
  mounted() {
    this.address = localStorage.getItem(`prevAddress`)
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    goToWelcome() {
      this.$store.commit(`setSessionModalView`, `welcome`)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
      this.$router.push(`/`)
      this.$store.commit(`toggleSessionModal`, false)
    },
    bech32Validate(param) {
      try {
        bech32.decode(param)
        return true
      } catch (error) {
        return false
      }
    }
  },
  validations() {
    return {
      address: { required, bech32Validate: this.bech32Validate }
    }
  }
}
</script>
<style>
.form-group a {
  cursor: pointer;
}
</style>
