<template lang="pug">
btn.btn-receive(
  @click.native.stop="openModal"
  value="Receive"
  icon="file_download"
  icon-pos="right"
  color="primary")
</template>

<script>
import { clipboard } from "electron"
import Btn from "@nylira/vue-button"
export default {
  components: { Btn },
  methods: {
    openModal() {
      this.$store.commit("setModalReceive", true)
    }
  }
}
</script>
