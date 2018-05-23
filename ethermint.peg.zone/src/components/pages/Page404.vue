<template lang="pug">
page(title="Error 404" subtitle="Page Not Found")
  text-container
    h2 Whoops!
    p The page you visited either does not exist or has been moved in a website reshuffle. We're sorry for the inconvenience. Try navigating with the website menu above.
    p Please create an issue on this project's #[a(:href="text.zoneWebsiteGitHub") GitHub repository] and we will fix this error as soon as we can. Thank you for your patience.
</template>

<script>
import { mapGetters } from 'vuex'
import Page from 'common/NiPage'
import TextContainer from 'common/NiTextContainer'
export default {
  name: 'page-intro',
  components: {
    Page,
    TextContainer
  },
  computed: { ...mapGetters(['text']) },
  mounted () {
    document.title = '404 - Cosmos - Internet of Blockchains'
  }
}
</script>
