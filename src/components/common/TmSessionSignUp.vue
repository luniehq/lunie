<template>
  <div class="session">
    <TmFormStruct :submit="onSubmit.bind(this)">
      <div class="session-header">
        <img
          v-if="!session.insecureMode"
          class="session-image"
          src="~assets/images/mobile-hand.svg"
        />
        <a @click="goBack">
          <i class="material-icons session-back">arrow_back</i>
        </a>
        <h2 class="session-title">
          Create a new address
        </h2>
        <a @click="$emit('close')">
          <i class="material-icons session-close">close</i>
        </a>
      </div>
      <div
        v-if="session.insecureMode"
        class="session-main"
      >
        <div class="danger-zone">
          <h2>DANGER ZONE</h2>
          <p>
            Creating an address or entering a seed phrase in the browser is
            considered extremely unsafe. These features are only enabled in
            insecure mode for testing purposes and should not be used on
            mainnet
            or with real tokens.
          </p>
          <TmFormGroup
            :error="$v.fields.signUpName.$error"
            field-id="sign-up-name"
            field-label="Account Name"
          >
            <TmField
              id="sign-up-name"
              v-model.trim="fields.signUpName"
              type="text"
              placeholder="Must be at least 5 characters"
              vue-focus="vue-focus"
            />
            <TmFormMsg
              v-if="
                $v.fields.signUpName.$error && !$v.fields.signUpName.required
              "
              name="Name"
              type="required"
            />
            <TmFormMsg
              v-if="
                $v.fields.signUpName.$error && !$v.fields.signUpName.minLength
              "
              name="Name"
              type="minLength"
              min="5"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.fields.signUpPassword.$error"
            field-id="sign-up-password"
            field-label="Password"
          >
            <TmField
              id="sign-up-password"
              v-model="fields.signUpPassword"
              type="password"
              placeholder="Must be at least 10 characters"
            />
            <TmFormMsg
              v-if="
                $v.fields.signUpPassword.$error &&
                  !$v.fields.signUpPassword.required
              "
              name="Password"
              type="required"
            />
            <TmFormMsg
              v-if="
                $v.fields.signUpPassword.$error &&
                  !$v.fields.signUpPassword.minLength
              "
              name="Password"
              type="minLength"
              min="10"
            />
          </TmFormGroup>
          <TmFormGroup
            :error="$v.fields.signUpPasswordConfirm.$error"
            field-id="sign-up-password-confirm"
            field-label="Confirm Password"
          >
            <TmField
              id="sign-up-password-confirm"
              v-model="fields.signUpPasswordConfirm"
              type="password"
              placeholder="Enter password again"
            />
            <TmFormMsg
              v-if="
                $v.fields.signUpPasswordConfirm.$error &&
                  !$v.fields.signUpPasswordConfirm.sameAsPassword
              "
              name="Password confirmation"
              type="match"
            />
          </TmFormGroup>
          <TmFormGroup
            field-id="sign-up-seed"
            class="sign-up-seed-group"
            field-label="Seed Phrase"
          >
            <FieldSeed
              id="sign-up-seed"
              v-model="fields.signUpSeed"
              class="field-seed"
            />
            <TmFormMsg
              type="custom"
              msg="Please back up the seed phrase for this account."
            />
          </TmFormGroup>
          <TmFormGroup
            class="field-checkbox"
            :error="$v.fields.signUpWarning.$error"
            field-id="sign-up-warning"
            field-label
          >
            <div class="field-checkbox-input">
              <input
                id="sign-up-warning"
                v-model="fields.signUpWarning"
                type="checkbox"
              />
              <label
                class="field-checkbox-label"
                for="sign-up-warning"
              >
                I understand that lost seeds cannot be recovered.
              </label>
            </div>
            <TmFormMsg
              v-if="
                $v.fields.signUpWarning.$error &&
                  !$v.fields.signUpWarning.required
              "
              name="Recovery confirmation"
              type="required"
            />
          </TmFormGroup>
          <TmFormGroup
            class="field-checkbox"
            :error="$v.fields.errorCollection.$error"
            field-id="error-collection"
            field-label
          >
            <div class="field-checkbox-input">
              <input
                id="error-collection"
                v-model="fields.errorCollection"
                type="checkbox"
              />
              <label
                class="field-checkbox-label"
                for="error-collection"
              >
                I'd like to opt in for remote error tracking to help improve
                Voyager.
              </label>
            </div>
          </TmFormGroup>
          <div class="session-footer">
            <TmBtn value="Create Address" />
          </div>
        </div>
      </div>
      <div
        v-if="!session.insecureMode"
        class="session-main"
      >
        <p>
          Creating an address in the browser is considered extremely unsafe. To
          offer you a more secure option we will be releasing a mobile app and
          a
          Chrome extension in the coming months.
        </p>
        <p>
          You can create a new account outside of the browser with a
          <a
            href="https://shop.ledger.com/?r=3dd204ef7508"
            target="_blank"
            rel="noopener norefferer"
          >Ledger Nano</a>
          or by using the
          <a
            href="https://hub.cosmos.network/docs/delegator-guide-cli.html#creating-an-account"
            target="_blank"
            rel="noopener norefferer"
          >command line</a>.
        </p>
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import FieldSeed from "common/TmFieldSeed"
export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    TmField,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    creating: true,
    fields: {
      signUpName: ``,
      signUpSeed: `Creating seed...`,
      signUpPassword: ``,
      signUpPasswordConfirm: ``,
      signUpWarning: false
    }
  }),
  computed: {
    ...mapGetters([`session`])
  },
  mounted() {
    this.$store.dispatch(`createSeed`).then(seedPhrase => {
      this.creating = false
      this.fields.signUpSeed = seedPhrase
    })
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    goBack() {
      this.$emit(`route-change`, "welcome")
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch(`createKey`, {
          seedPhrase: this.fields.signUpSeed,
          password: this.fields.signUpPassword,
          name: this.fields.signUpName
        })
        this.$emit(`close`)
        this.$store.commit(`notify`, {
          title: `Signed Up`,
          body: `Your account has been created.`
        })
        this.$store.dispatch(`signIn`, {
          password: this.fields.signUpPassword,
          localKeyPairName: this.fields.signUpName
        })
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Couldn't create account`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    fields: {
      signUpName: { required, minLength: minLength(5) },
      signUpPassword: { required, minLength: minLength(10) },
      signUpPasswordConfirm: { sameAsPassword: sameAs(`signUpPassword`) },
      signUpWarning: { required: sameAs(() => true) },
      errorCollection: false
    }
  })
}
</script>

<style scoped>
.danger-zone {
  border: 2px solid var(--danger-bc);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  padding: 1rem;
}

.danger-zone p {
  font-size: var(--sm);
  color: var(--danger);
}

.danger-zone h2 {
  font-weight: 700;
  font-size: var(--m);
  color: var(--danger);
}

.field-seed {
  line-height: var(--lg);
  padding: 0.75rem;
  resize: none;
}
</style>
