<template>
  <SessionFrame>
    <div class="session">
      <a v-if="inExtension" @click="goBack">
        <i class="material-icons session-back">arrow_back</i>
      </a>
      <TmFormStruct :submit="onSubmit.bind(this)">
        <h2 class="session-title">
          Create a new address
        </h2>
        <div v-if="session.insecureMode" class="session-main">
          <div class="danger-zone">
            <h2>DANGER ZONE</h2>
            <p>
              Creating an address in the browser is not advised. This feature is
              only enabled in insecure mode for testing purposes and should not
              be used otherwise.
            </p>
          </div>
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
            <FieldSeed id="sign-up-seed" v-model="fields.signUpSeed" />
          </TmFormGroup>
          <TmFormGroup
            class="field-checkbox"
            :error="$v.fields.signUpWarning.$error"
            field-id="sign-up-warning"
            field-label
          >
            <div class="field-checkbox-input">
              <label class="field-checkbox-label" for="sign-up-warning">
                <input
                  id="sign-up-warning"
                  v-model="fields.signUpWarning"
                  type="checkbox"
                />
                I understand that lost seeds cannot be recovered.</label
              >
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
              <label class="field-checkbox-label" for="error-collection">
                <input
                  id="error-collection"
                  v-model="fields.errorCollection"
                  type="checkbox"
                />
                I'd like to opt in for remote error tracking to help improve
                Voyager.
              </label>
            </div>
          </TmFormGroup>
          <div class="session-footer">
            <TmBtn value="Create Address" />
          </div>
        </div>
        <div v-if="!session.insecureMode" class="session-main">
          <p>
            Creating an address in the browser is unsafe. To offer you a secure
            alternative we will be releasing a browser extension and a mobile
            app soon.
          </p>
          <p>
            In the meantime, you can create a new account outside of the browser
            by using a
            <a
              href="https://shop.ledger.com/?r=3dd204ef7508"
              target="_blank"
              rel="noopener norefferer"
              >Ledger Nano</a
            >
            or the
            <a
              href="https://hub.cosmos.network/docs/delegator-guide-cli.html#creating-an-account"
              target="_blank"
              rel="noopener norefferer"
              >command line</a
            >.
          </p>
          <router-link to="existing"
            >Want to use an existing address?</router-link
          >
        </div>
      </TmFormStruct>
    </div>
  </SessionFrame>
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
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-sign-up`,
  components: {
    TmBtn,
    TmField,
    SessionFrame,
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
    ...mapGetters([`session`]),
    inExtension() {
      if (this.$store.getters.extension) {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {
    this.$store.dispatch(`createSeed`).then(seedPhrase => {
      this.creating = false
      this.fields.signUpSeed = seedPhrase
    })
  },
  methods: {
    goBack() {
      this.$router.push(`/welcome`)
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
        this.$router.push(`/`)
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
  margin: 0;
}

.danger-zone h2 {
  font-weight: 700;
  font-size: var(--m);
  color: var(--danger);
  padding-bottom: 0.25rem;
}
</style>
