<template>
  <div class="session">
    <TmFormStruct :submit="onSubmit" class="session-container">
      <SessionFrame previous-route="existing">
        <template v-slot:title>
          Explore with any address
        </template>
      </SessionFrame>
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
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import SessionFrame from "common/SessionFrame"
import bech32 from "bech32"
export default {
  name: `session-explore`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    SessionFrame
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
      this.$emit(`route-change`, value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
      this.$emit(`close`)
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
