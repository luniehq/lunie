<template lang="pug">
tm-btn.btn-receive(
  @click.native.stop="openModal"
  value="Receive"
  icon="file_download"
  icon-pos="right"
  color="primary")
</template>

<script>
import { clipboard } from "electron"
import { TmBtn } from "@tendermint/ui"
export default {
  components: { TmBtn },
  methods: {
    openModal() {
      this.$store.commit("setModalReceive", true)
    }
  }
}
</script>
