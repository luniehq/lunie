<template>
  <div class="tm-page page-profile">
    <tm-page-header>
      <slot slot="menu-body" name="menu-body" />
      <div slot="menu"><slot name="menu"></slot></div>
    </tm-page-header>
    <main class="tm-page-main"><slot></slot></main>
  </div>
</template>

<script>
import TmPageHeader from "common/TmPageHeader.vue"

export default {
  name: `page-profile`,
  components: {
    TmPageHeader
  }
}
</script>

<style>
.column {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.row-unjustified {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.page-profile__section {
  margin-bottom: 1rem;
}

.page-profile__section--between > .row {
  justify-content: space-between;
}

.page-profile__header {
  background-color: var(--app-fg);
}

.page-profile__header .avatar {
  background: var(--app-nav);
  height: 8rem;
  width: 8rem;
  margin: 1rem 2rem 1rem 1rem;
  padding: 1rem;
}

.page-profile__header__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-profile__status-and-title {
  position: relative;
}

.page-profile__status {
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  left: -1rem;
  top: 1rem;
  position: absolute;
  width: 0.5rem;
}

.page-profile__title {
  color: #fff;
  display: inline-block;
  font-size: var(--h1);
  line-height: var(--h1);
  font-weight: 400;
  padding: 0 0.5rem 0.5rem 0;
}

.page-profile__header__actions {
  display: flex;
  flex-direction: column;
  margin-right: 2rem;
}

.page-profile__header__actions button:first-child {
  margin-bottom: 0.5rem;
}

.page-profile__status.red {
  background: var(--danger);
}

.page-profile__status.yellow {
  background: var(--warning);
}

.page-profile__status.green {
  background: var(--success);
}

.page-profile__status.blue {
  background: var(--primary);
}

.colored_dl {
  width: 100%;
}

.info_dl {
  padding: 1rem;
  border: 1px solid var(--bc-dim);
  background-color: var(--app-fg);
  line-height: 1.25rem;
}

.info_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 2px;
  font-weight: 500;
}

.info_dl dd {
  font-size: 1rem;
  line-height: 1rem;
  color: var(--bright);
}
</style>
