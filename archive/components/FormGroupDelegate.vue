<template lang="pug">
tm-form-group(:class='cssClass' :error="$v.fields.atoms.$error")
  i.fa.fa-check-square-o(@click='rm(delegate.id)')
  router-link.id(:to="{ name: 'delegate', params: { delegate: delegate.id } }")
    | {{ delegate.keybaseID }}
  field(
    theme="cosmos"
    type="number"
    placeholder="Atoms"
    v-model="fields.atoms")
  form-msg(
    name="Atoms"
    type="required"
    v-if="!$v.fields.atoms.required")
</template>

<script>
import { mapGetters } from "vuex"
import Field from "@nylira/vue-field"
import Btn from "@nylira/vue-button"
import { TmFormGroup } from "@tendermint/ui"
import FormMsg from "common/NiFormMsg"
export default {
  name: "card-delegate-atoms",
  props: ["delegate"],
  components: {
    Btn,
    Field,
    TmFormGroup,
    FormMsg
  },
  computed: {
    ...mapGetters(["shoppingCart", "delegates"]),
    cssClass() {
      let value = "card-delegate-atoms"
      return value
    }
  },
  methods: {
    rm(delegateId) {
      this.$store.commit("removeFromCart", delegateId)
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.card-delegate-atoms
  border px solid bc
  margin-bottom 1rem

  .id
    color txt
</style>
