<template>
  <tm-page data-title="About" hide-header>
    <div class="container">
      <h1>About</h1>
      <p>
        Lunie was the <b>first</b> visual interface ever build for the Cosmos
        network. We develope Lunie putting the <b>user first</b>. We try to <b>
          reduce the complexity
        </b> of blockchain to minimum so you can <b>focus</b> on what you really
        aim to do. We want to keep Lunie <b>Open Source</b> so the community can
        grow from the learnings we have had already.
        The developers of Lunie accompanied the Cosmos SDK team to build
        the amazing
        tooling that exist today for building visual interfaces for Cosmos.
        We want to continue assisting developement in the network so we all
        can benefit. We want to keep Lunie <b>independent</b> from validators so
        there is an entity you can trust.
      </p>
      <br>
      <br>
      <h1>Contact</h1>
      <p>
        Lunie International Software Systems inc.<br>
        Sesame Street 1<br>
        123 Funland<br>
        Canada<br>
        contact@lunie.io<br>
      </p>
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
.container {
  padding: 1rem;
}
</style>
