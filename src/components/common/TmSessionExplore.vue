<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Explore with any address
      </h2>

      <div v-if="session.addresses.length > 0" class="address-list">
        <div v-for="account in session.addresses" v-bind:key="account.address">
          <div class="tm-li-session">
            <div class="tm-li-session-icon">
              <i class="material-icons circle">{{
                getAddressIcon(account.type)
              }}</i>
            </div>
            <div class="tm-li-session-text">
              <div class="tm-li-session-title">
                <span>{{ shortenAddress(account.address) }}</span>
              </div>
            </div>
            <div class="tm-li-session-icon">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>
        </div>
      </div>

      <div class="session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Other Cosmos Address">
          <TmField
            v-model="address"
            type="text"
            placeholder=""
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Address"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.bech32Validate"
            name="Your Cosmos Address"
            type="bech32"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.isNotAValidatorAddress"
            name="You can't sign in with a validator address"
            type="custom"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState } from "vuex"
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
export default {
  name: `session-explore`,
  components: {
    SessionFrame,
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
    ...mapState([`session`])
  },
  mounted() {
    console.log(this.session)
    this.address = localStorage.getItem(`prevAddress`)
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })
      localStorage.setItem(`prevAddress`, this.address)
      this.$router.push(`/`)
    },
    bech32Validate(param) {
      try {
        bech32.decode(param)
        return true
      } catch (error) {
        return false
      }
    },
    isNotAValidatorAddress(param) {
      if (param.substring(0, 13) !== "cosmosvaloper") {
        return true
      } else {
        return false
      }
    },
    getAddressIcon(addressType) {
      if (addressType === "explore") return `language`
      if (addressType === "ledger") return `vpn_key`
      if (addressType === "extension") return `laptop`
      return false
    },
    shortenAddress(address) {
      return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`
    }
  },
  validations() {
    return {
      address: {
        required,
        bech32Validate: this.bech32Validate,
        isNotAValidatorAddress: this.isNotAValidatorAddress
      }
    }
  }
}
</script>
<style scoped>
.tm-li-session {
  display: flex;
  padding: 1rem;
  margin-bottom: 0.25rem;
  border: 2px solid var(--bc);
  background-color: var(--app-fg);
  border-radius: 0.25rem;
}

.tm-li-session:hover {
  cursor: pointer;
  background: var(--hover-bg);
}

.tm-li-session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-session-icon i {
  font-size: 1.25rem;
}

.tm-li-session-title {
  color: var(--bright);
  font-size: var(--h4);
  font-weight: 400;
}

.tm-li-session-text {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  padding: 0 1rem;
}

.material-icons.circle {
  border: 2px solid var(--dim);
  border-radius: 50%;
  padding: 0.5rem;
}
</style>
