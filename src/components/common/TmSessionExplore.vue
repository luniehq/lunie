<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title bottom-indent">Explore with any address</h2>

      <div v-if="session.addresses.length > 0" class="session-list">
        <div
          v-for="account in filteredAddresses"
          :key="account.address"
          :title="account.address"
          @click="exploreWith(account.address)"
        >
          <div class="tm-li-session">
            <div class="tm-li-session-icon">
              <i class="material-icons notranslate circle">{{
                getAddressIcon(account.type)
              }}</i>
            </div>
            <div class="tm-li-session-text">
              <div class="tm-li-session-title">
                <span>{{ account.address | formatAddress(12) }}</span>
                <p class="tm-li-session-subtitle">
                  {{ getAddressTypeDescription(account.type) }}
                </p>
              </div>
            </div>
            <div class="tm-li-session-icon">
              <i class="material-icons notranslate">arrow_forward</i>
            </div>
          </div>
        </div>
      </div>

      <div class="session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Your Address">
          <TmField
            v-model="address"
            type="text"
            placeholder
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.address.$error && !$v.address.required"
            name="Address"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.addressValidate"
            name="Your Address"
            type="bech32"
          />
          <TmFormMsg
            v-else-if="$v.address.$error && !$v.address.isNotAValidatorAddress"
            name="You can't sign in with a validator address"
            type="custom"
          />
          <TmFormMsg
            v-else-if="
              $v.address.$error && !$v.address.isAWhitelistedBech32Prefix
            "
            name="You can only sign in with a regular address"
            type="custom"
          />
          <TmFormMsg v-else-if="error" :name="error" type="custom" />
        </TmFormGroup>
      </div>
      <TmFormGroup
        class="field-checkbox"
        field-id="sign-up-warning"
        field-label
      >
        <div class="field-checkbox-input">
          <label class="field-checkbox-label" for="select-testnet">
            <input id="select-testnet" v-model="testnet" type="checkbox" />
            This is a testnet address
          </label>
        </div>
      </TmFormGroup>
      <div class="session-footer">
        <TmBtn value="Explore" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import bech32 from "bech32"
import { formatAddress } from "src/filters"
import { isAddress } from "web3-utils"
import gql from "graphql-tag"
const isEthereumAddress = isAddress

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
    formatAddress
  },
  data: () => ({
    address: ``,
    error: ``,
    addressPrefixes: [],
    testnet: false
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`]),
    filteredAddresses() {
      const selectedNetwork = this.addressPrefixes.find(
        ({ id }) => id === this.network
      )
      // handling query not loaded yet or failed
      if (!selectedNetwork) return []

      return this.session.addresses
        .filter(address =>
          address.address.startsWith(selectedNetwork.address_prefix)
        )
        .slice(-3)
    },
    networkOfAddress() {
      const selectedNetworksArray = this.addressPrefixes.filter(
        ({ address_prefix }) => this.address.startsWith(address_prefix)
      )

      const selectedNetwork = selectedNetworksArray.find(({ testnet }) =>
        this.testnet ? testnet === true : testnet === false
      )

      return selectedNetwork
    }
  },
  mounted() {
    this.address = localStorage.getItem(`prevAddress`)
  },
  methods: {
    async onSubmit() {
      this.error = null
      this.$v.$touch()
      if (this.$v.$error) return

      if (!this.networkOfAddress) {
        this.error = `No ${
          this.testnet ? "testnet" : "mainnet"
        } for this address found`
        return
      }

      // needs to be done first because if not we are logging into the current network
      await this.selectNetworkByAddress()
      this.$store.dispatch(`signIn`, {
        sessionType: `explore`,
        address: this.address
      })

      localStorage.setItem(`prevAddress`, this.address)
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: this.networkOfAddress.slug
        }
      })
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
      // TODO this only works for cosmos
      if (param.substring(0, 13) !== "cosmosvaloper") {
        return true
      } else {
        return false
      }
    },
    isAWhitelistedBech32Prefix(param) {
      if (
        param.substring(0, 7) === "cosmos1" ||
        param.substring(0, 6) === "terra1" ||
        param.substring(0, 5) === "xrn:1" ||
        param.substring(0, 7) === "emoney1" ||
        param.substring(0, 2) === "0x"
      ) {
        return true
      } else {
        return false
      }
    },
    async selectNetworkByAddress() {
      this.$store.dispatch(`setNetwork`, this.networkOfAddress)
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
    async exploreWith(address) {
      this.address = address
      await this.onSubmit()
    },
    isEthereumAddress(address) {
      return isEthereumAddress(address)
    },
    addressValidate(address) {
      return this.bech32Validate(address) || this.isEthereumAddress(address)
    }
  },
  validations() {
    return {
      address: {
        required,
        addressValidate: this.addressValidate,
        isNotAValidatorAddress: this.isNotAValidatorAddress,
        isAWhitelistedBech32Prefix: this.isAWhitelistedBech32Prefix
      }
    }
  },
  apollo: {
    addressPrefixes: {
      query: gql`
        query Network {
          networks {
            id
            address_prefix
            testnet
            slug
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        return data.networks || []
      },
      fetchPolicy: "cache-first"
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
  color: var(--dim);
  border-radius: 50%;
  padding: 0.5rem;
}

.button {
  min-width: 90px;
}
</style>
