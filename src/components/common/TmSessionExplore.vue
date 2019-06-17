<template>
  <div class="session">
    <TmFormStruct :submit="onSubmit" class="session-container">
      <div class="session-header">
        <a @click="goBack()">
          <i class="material-icons session-back">arrow_back</i>
        </a>
        <h2 class="session-title">
          Explore with any address
        </h2>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons session-close">close</i>
        </a>
      </div>
      <div class="session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Your Cosmos Address">
          <TmField
            v-model="address"
            type="text"
            placeholder=""
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Name"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.bech32Validate"
            name="Your Cosmos Address"
            type="bech32"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
export default {
  name: `session-explore`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    address: ``,
    error: ``
  }),
  computed: {
    ...mapGetters([`session`]),
    accountExists() {
      return this.session.accounts.length > 0
    }
  },
  mounted() {
    this.address = localStorage.getItem(`prevAddress`)
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    goBack() {
      this.$store.commit(`setSessionModalView`, `existing`)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
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
