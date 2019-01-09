<template>
  <div class="tm-page page-profile">
    <tm-page-header>
      <template slot="menu-body"
        ><slot name="menu-body"></slot
      ></template>
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
.page-profile__section {
  background-color: var(--app-fg);
  display: flex;
  margin-bottom: 1rem;
  padding: 2rem;
  min-width: 63rem;
}

.column {
  display: flex;
  flex-flow: column;
  position: relative;
}

.row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.page-profile__header .avatar {
  background: var(--app-nav);
  border-radius: 50%;
  height: 155px;
  margin-right: 2rem;
  padding: 1rem;
  width: 155px;
}

.page-profile__header__info {
  flex: 1;
}

.page-profile__header__name {
  margin-bottom: 2rem;
}

.page-profile__header__name__title {
  color: #fff;
  display: inline-block;
  font-size: var(--h1);
  line-height: var(--h1);
  font-weight: 400;
  padding: 0 0.5rem 0.5rem 0;
}

.page-profile__header__name__address {
  font-size: var(--sm);
}

.page-profile__header__actions {
  flex-flow: column;
  margin-left: auto;
}

.page-profile__header__actions button:not(:last-child) {
  margin-bottom: 0.5rem;
}

.page-profile__header__data__break {
  border-right: 1px solid var(--bc-dim);
  margin-right: 1rem;
}

.page-profile__status {
  border-radius: 50%;
  display: inline-block;
  height: 0.5rem;
  left: -1rem;
  position: absolute;
  width: 0.5rem;
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

.page-profile__status-and-title {
  align-items: center;
  display: flex;
}

.page-profile__details > .row > .column {
  flex: 1;
}

.info_dl {
  display: flex;
  flex-flow: column;
  margin-bottom: 1.5rem;
  margin-right: 1rem;
}

.info_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 4px;
}

.info_dl dd {
  border: solid 1px #31354e;
  border-radius: 2px;
  font-size: 1rem;
  line-height: 1rem;
  padding: 0.5rem;
}

.info_dl dd.info_dl__text-box {
  min-height: 6.91rem;
}

.colored_dl {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 7rem;
}

.colored_dl:not(:last-child) {
  margin-right: 1rem;
}

.colored_dl dt {
  color: var(--dim);
  font-size: var(--sm);
  margin-bottom: 0.5rem;
  text-align: center;
}

.colored_dl dd {
  background-color: var(--white-fade-1);
  border: 1px solid var(--white-fade-2);
  border-radius: 4px;
  color: var(--dim);
  display: block;
  font-size: h6;
  line-height: h6;
  padding: 4px 4px;
  text-align: right;
  width: 100%;
}

.colored_dl dd.red {
  background-color: rgba(209, 2, 0, 0.15);
  border: solid 0.5px rgba(209, 2, 0, 0.25);
  color: #ff0200;
}

.colored_dl dd.yellow {
  background-color: rgba(255, 149, 2, 0.15);
  border: solid 0.5px rgba(255, 149, 2, 0.25);
  color: #ff9502;
}

.colored_dl dd.green {
  background-color: rgba(46, 164, 45, 0.15);
  border: solid 0.5px rgba(46, 164, 45, 0.25);
  color: #2ea42d;
}
</style>
