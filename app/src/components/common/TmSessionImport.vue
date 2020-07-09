<template>
  <SessionFrame :icon="`settings_backup_restore`">
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main bottom-indent">
        <Steps :steps="[`Recover`, `Name`, `Password`]" active-step="Recover" />
        <TmFormGroup
          :error="$v.$error && $v.seed.$invalid"
          field-id="import-seed"
          field-label="Backup code"
        >
          <FieldSeed
            id="import-seed"
            :value="seed"
            :placeholder="
              isPolkadot
                ? 'Must be your seed phrase or private key hash'
                : 'Must be exactly 12 or 24 words'
            "
            @input="val => (seed = val)"
          />
          <div class="polkadot-algorithm-div">
            <span>{{ polkadotAlgo }}</span>
            <label v-if="isPolkadot" class="polkadot-algorithm-switch">
              <input
                v-model="polkadotAlgoCheckbox"
                type="checkbox"
                @change="switchPolkadotAlgorithm()"
              />
              <span class="slider round"></span>
            </label>
          </div>
          <TmFormMsg
            v-if="$v.seed.$error && !$v.seed.required"
            name="Seed"
            type="required"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedHasCorrectLength"
            name="Seed"
            :type="isPolkadot ? 'incorrectPolkadotSeed' : 'words12or24'"
          />
          <TmFormMsg
            v-else-if="$v.seed.$error && !$v.seed.seedIsLowerCaseAndSpaces"
            name="Seed"
            :type="isPolkadot ? 'incorrectPolkadotSeed' : 'lowercaseAndSpaces'"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" type="submit" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { required } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import Steps from "../../ActionModal/components/Steps"
import { mnemonicValidate } from "@polkadot/util-crypto"

const has12or24words = (param) => {
  return (
    param && (param.split(` `).length === 12 || param.split(` `).length === 24)
  )
}
const isHex = (value) => {
  return /0x[0-9a-f]+/i.test(value)
}

const lowerCaseAndSpaces = (param) => {
  const seedWordsAreLowerCaseAndSpaces = /^([a-z]+\s)*[a-z]+$/g
  if (param.match(seedWordsAreLowerCaseAndSpaces)) {
    return param === param.match(seedWordsAreLowerCaseAndSpaces)[0]
  }
  return false
}
// exporting these for testing
export const isPolkadotHexSeed = (seed) => {
  return isHex(seed) && seed.length === 66
}

export const polkadotRawSeedValidate = (seed) => {
  return (seed.length > 0 && seed.length <= 32) || isPolkadotHexSeed(seed)
}

export const polkadotValidation = (seed) => {
  return mnemonicValidate(seed) || polkadotRawSeedValidate(seed)
}

export default {
  name: `session-import-backupcode`,
  components: {
    TmBtn,
    SessionFrame,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct,
    Steps,
  },
  data: () => {
    return {
      polkadotAlgo: "Schnorrkel",
      polkadotAlgoCheckbox: false,
      polkadotAlgoDictionary: {
        Schnorrkel: "sr25519",
        Edwards: "ed25519"
      }
    }
  },
  computed: {
    ...mapGetters([`recover`, `currentNetwork`]),
    seed: {
      get() {
        return this.$store.state.recover.seed
      },
      set(value) {
        this.$store.commit(`updateField`, {
          field: `seed`,
          value: value.trim(), // remove spaces from beginning and end of string
        })
      },
    },
    isPolkadot() {
      return this.currentNetwork.network_type === "polkadot"
    },
  },
  methods: {
    onSubmit() {
      this.$v.$touch()
      if (this.$v.seed.$invalid || this.$v.seed.$invalid) return
      this.$router.push("/recover/name")
    },
    switchPolkadotAlgorithm() {
      this.polkadotAlgo = this.polkadotAlgoCheckbox ? "Edwards" : "Schnorrkel"
      this.$store.dispatch(
        "setPolkadotAlgo",
        this.polkadotAlgoDictionary[this.polkadotAlgo]
      )
    }
  },
  validations() {
    return {
      seed: {
        required,
        seedIsLowerCaseAndSpaces: (param) =>
          this.isPolkadot
            ? polkadotValidation(param)
            : lowerCaseAndSpaces(param),
        seedHasCorrectLength: (param) =>
          this.isPolkadot ? polkadotValidation(param) : has12or24words(param),
      },
    }
  },
}
</script>
<style scoped>
.polkadot-algorithm-div {
  margin-top: 2vh;
}

.polkadot-algorithm-div span {
  display: block;
  font-style: italic;
  font-size: 1.7vh;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 1vh;
}

.polkadot-algorithm-switch {
  position: relative;
  display: block;
  width: 11vw;
  height: 6vh;
}

.polkadot-algorithm-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--primary-hover);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-hover);
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
