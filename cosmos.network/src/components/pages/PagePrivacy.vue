<template lang="pug">
page(
  title="Privacy Policy"
  subtitle="Learn about our strict privacy policy.")
  text-container(
    url='https://api.github.com/repos/tendermint/aib-data/contents/md/privacy-policy-icf.md')
</template>

<script>
import TextContainer from "common/NiTextContainer"
import Page from "common/NiPage"
export default {
  name: "page-privacy",
  metaInfo: { title: "Privacy Policy" },
  components: {
    Page,
    TextContainer
  }
}
</script>
