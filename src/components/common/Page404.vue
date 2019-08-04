<template>
  <TmPage data-title="404" class="four-oh-four" hide-header>
    <TmPart class="four-oh-four-top">
      <h2>Oops! We can't find the page you're looking for.</h2>
      <h3>Error code: 404</h3>
    </TmPart>
    <TmPart>
      <p>Here are some helpful links to get you out of here:</p>
      <ul>
        <li>
          <router-link to="/">
            Network
          </router-link>
        </li>
        <li>
          <router-link to="/portfolio">
            Portfolio
          </router-link>
        </li>
        <li>
          <router-link to="/transactions">
            Transactions
          </router-link>
        </li>
        <li>
          <router-link to="/validators">
            Validators
          </router-link>
        </li>
        <li>
          <router-link to="/proposals">
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
export default {
  name: `page-404`,
  components: {
    TmPage,
    TmPart
  }
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
