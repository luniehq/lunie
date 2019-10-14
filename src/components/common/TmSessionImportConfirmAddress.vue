<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit">
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
        <Steps
          :steps="[`Recover`, `Confirm`, `Name`, `Password`, `Success`]"
          active-step="Confirm"
        />
        <TmFormGroup field-id="import-name" field-label="Address">
          <pre>{{ importCosmosAddress }}</pre>
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" type="submit" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import Steps from "../../ActionModal/components/Steps"

export default {
  name: `session-import`,
  components: {
    TmBtn,
    SessionFrame,
    TmFormGroup,
    TmFormStruct,
    Steps
  },
  data: () => ({
    importCosmosAddress: {}
  }),
  computed: {
    ...mapGetters([`recover`])
  },
  async created() {
    this.importCosmosAddress = await this.$store.dispatch(
      `getAddressFromSeed`,
      this.$store.state.recover.seed
    )
  },
  methods: {
    onSubmit() {
      this.$router.push("/recover/name")
    }
  }
}
</script>
