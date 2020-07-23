<template>
  <TmPage data-title="404" class="four-oh-four">
    <TmPart class="four-oh-four-top">
      <h2>Oops! We can't find the page you're looking for.</h2>
      <h3>Error code: 404</h3>
    </TmPart>
    <TmPart>
      <p>Here are some helpful links to get you out of here:</p>
      <ul>
        <li>
          <router-link
            :to="{ name: 'portfolio', params: { networkId: networkSlug } }"
          >
            Portfolio
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'validators', params: { networkId: networkSlug } }"
          >
            Validators
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'transactions', params: { networkId: networkSlug } }"
          >
            Transactions
          </router-link>
        </li>
        <li>
          <router-link
            :to="{ name: 'proposals', params: { networkId: networkSlug } }"
          >
            Proposals
          </router-link>
        </li>
      </ul>
    </TmPart>
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import { mapGetters } from "vuex"
export default {
  name: `page-404`,
  components: {
    TmPage,
    TmPart,
  },
  computed: {
    ...mapGetters([`networkSlug`]),
  },
}
</script>

<style>
.four-oh-four {
  padding: 2rem;
  background: var(--black);
  border-left: 1px solid var(--bc-dim);
}

.four-oh-four h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}

.four-oh-four h3 {
  color: var(--text);
  font-size: var(--h3);
  font-weight: 500;
  margin-top: 0;
}

.four-oh-four ul {
  padding-top: 1rem;
}
</style>
