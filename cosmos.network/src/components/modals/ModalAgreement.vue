<template lang="pug">
modal.modal-agreement(size='fullscreen')
  div(slot='title') HackAtom Participation Agreement
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/developers-hackatom-agreement.md')
  div(slot='footer')
    btn(value='Cancel', @click.native='no')
    btn(value='Agree', @click.native='yes')
</template>

<script>
import { mapGetters } from "vuex"
import Btn from "@nylira/vue-button"
import Modal from "modals/Modal"
import TextContainer from "common/NiTextContainer"
export default {
  name: "modal-agreement",
  components: {
    Btn,
    Modal,
    TextContainer
  },
  computed: {
    ...mapGetters(["links"])
  },
  methods: {
    yes() {
      this.$store.commit("setHackAtomAgreed", true)
      window.location.href = this.links.cosmos.hackathon.two
    },
    no() {
      this.$store.commit("setHackAtomModal", false)
    }
  }
}
</script>
