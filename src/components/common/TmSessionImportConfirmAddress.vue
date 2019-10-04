<template>
  <SessionFrame>
    <TmFormStruct>
      <h2 class="session-title">
        Recover with backup code
      </h2>
      <div class="session-main">
        <TmFormGroup field-id="import-name" field-label="Address">
          <pre>{{ importCosmosAddress }}</pre>
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Next" @click.native="$router.push('/recover/name')" />
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
export default {
  name: `session-import`,
  components: {
    TmBtn,
    SessionFrame,
    TmFormGroup,
    TmFormStruct
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
  }
}
</script>
