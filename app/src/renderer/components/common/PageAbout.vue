<template>
  <tm-page data-title="About" hide-header>
    <div class="container">
      <div class="card">
        <h1>About</h1>
        <p>
          Lunie was the <b>first</b> visual interface ever build for the Cosmos
          network. We develop Lunie putting the <b>user first</b>. We try to <b>
            reduce the complexity
          </b> of blockchain to minimum so you can <b>focus</b> on what
          you really
          aim to do. We want to keep Lunie <b>Open Source</b> so the
          community can
          grow from the learnings we have had already.
          The developers of Lunie accompanied the Cosmos SDK team to build
          the amazing
          tooling that exist today for building visual interfaces for Cosmos.
          We want to continue assisting development in the network so we all
          can benefit. We want to keep Lunie <b>independent</b>
          from validators so
          there is an entity you can trust.
        </p>
      </div>
      <div class="card">
        <h1>Team</h1>
        We are working enthusiastically to develop Lunie for you.<br>
        <br>
        <div class="flex-row">
          <div class="profile">
            <img src="~assets/images/team/jordan.jpg">
            <span>Jordan Bible<br>CEO<br>Canada</span>
          </div>
          <div class="profile">
            <img src="~assets/images/team/fabo.jpg">
            <span>Fabian Weber<br>CTO<br>Germany</span>
          </div>
          <div class="profile">
            <img src="~assets/images/team/fede.jpg">
            <span>Federico Kunze<br>Software Engineer<br>Chile</span>
          </div>
        </div>
      </div>
      <div class="card">
        <h1>Contact</h1>
        <p>
          We are happy about any feedback or question. Write us at:<br>
          <br>
          <a href="mailto:contact@lunie.io">contact[at]lunie.io</a><br>
          <a href="https://github.com/cosmos/lunie">GitHub</a><br>
          <a href="https://forum.cosmos.network/c/wallet">Cosmos Forum</a>
        </p>
      </div>
    </div>
  </tm-page>
</template>

<script>
import TmPage from "common/TmPage"
export default {
  name: `page-about`,
  components: {
    TmPage
  }
}
</script>

<style scoped>
h1 {
  font-size: var(--xl);
  margin-bottom: 1rem;
}

b {
  font-weight: 700;
  color: var(--link);
}

.card {
  background: var(--app-fg);
  padding: 4rem;
  margin: 1rem;
  border-radius: 0.25rem;
}

.flex-row {
  display: flex;
  flex-flow: row wrap;
  margin-top: -1rem;
}

.flex-row > * {
  margin-top: 1rem;
}

.profile {
  display: flex;
  height: 9rem;
  flex-direction: row;
  align-items: center;
  min-width: 20rem;
}

.profile img {
  height: 8rem;
  width: 8rem;
  border-radius: 50%;
  margin-right: 1rem;
}
</style>
