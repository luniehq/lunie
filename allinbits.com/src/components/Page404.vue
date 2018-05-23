<template>
  <page-split>
    <page-header
      title="Error 404"
      subtitle="Page Not Found"
      slot="header"
      type="split">
    </page-header>
    <article-body>
      <p><strong>Whoops!</strong> The page you visited either does not exist or has been moved in a website reshuffle. We're sorry for the inconvenience. Try visiting one of these pages below:</p>
      <ul>
        <li><router-link :to="'/'">Home</router-link></li>
        <li><router-link :to="'/about'">About</router-link></li>
        <li><router-link :to="'/offices'">Offices</router-link></li>
        <li><router-link :to="'/careers'">Careers</router-link></li>
      </ul>
      <p>Please notify us at <a href="mailto:hello@tendermint.com">hello@tendermint.com</a> and we will fix this error as soon as we can. Thank you for your patience.</p>
    </article-body>
  </page-split>
</template>

<script>
import PageSplit from '@nylira/vue-page-split'
import PageHeader from '@nylira/vue-page-header'
import ArticleBody from '@nylira/vue-article-body'
export default {
  name: 'page-404',
  components: {
    PageSplit,
    PageHeader,
    ArticleBody
  },
  mounted () {
    document.title = '404 - All In Bits, Inc.'
  }
}
</script>
