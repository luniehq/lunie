<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Explore with any address
      </h2>

      <div v-if="session.addresses.length > 0" class="session-list">
        <div
          v-for="account in session.addresses.slice(-3)"
          :key="account.address"
          :title="account.address"
          @click="exploreWith(account.address)"
        >
          <div class="tm-li-session">
            <div class="tm-li-session-icon">
              <i class="material-icons circle">
                {{ getAddressIcon(account.type) }}
              </i>
            </div>
            <div class="tm-li-session-text">
              <div class="tm-li-session-title">
                <span>{{ account.address | formatBech32(false, 12) }}</span>
                <p class="tm-li-session-subtitle">
                  {{ getAddressTypeDescription(account.type) }}
                </p>
              </div>
            </div>
            <div class="tm-li-session-icon">
              <i class="material-icons">arrow_forward</i>
            </div>
          </div>
        </div>
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
import { formatBech32 } from "src/filters"

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
  filters: {
    formatBech32
  },
  data: () => ({
    address: ``,
    error: ``
  }),
  computed: {
    ...mapState([`session`])
  },
  mounted() {
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
      if (addressType === "local") return `phone_iphone`
    },
    getAddressTypeDescription(addressType) {
      if (addressType === "explore") return `Explore Mode`
      if (addressType === "ledger") return `Ledger Nano S`
      if (addressType === "extension") return `Lunie Browser Extension`
      if (addressType === "local") return `Mobile App`
    },
    exploreWith(address) {
      this.address = address
      this.onSubmit()
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
  margin-top: -0.4rem;
}

.tm-li-session-subtitle {
  display: block;
  width: 100%;
  font-size: var(--h6);
  font-weight: 400;
  color: var(--dim);
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
