<template lang="pug">
page(title="Privacy Policy" subtitle="Learn about our privacy policy.")
  text-container(url='https://api.github.com/repos/tendermint/aib-data/contents/md/privacy-policy-aib.md')
</template>

<script>
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-privacy",
  metaInfo: { title: "Privacy Policy" },
  components: {
    Page,
    TextContainer
  }
}
</script>
