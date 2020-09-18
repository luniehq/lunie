<template>
  <section id="proposal-timeline">
    <ul class="timeline">
      <li
        v-for="phase in timeline"
        :key="phase.title"
        class="phase"
        :class="{ done: wasInThePast(phase.time) }"
      >
        <h4>{{ phase.title }}</h4>
        <span class="time">
          <template v-if="phase.time">{{ phase.time | moment }}</template>
          <template v-else>?</template>
        </span>
      </li>
    </ul>
  </section>
</template>

<script>
import moment from "moment"

export default {
  name: `timeline`,
  filters: {
    moment: function (date) {
      return moment(date).fromNow()
    },
  },
  props: {
    timeline: {
      type: Array,
      required: true,
    },
  },
  methods: {
    wasInThePast(time) {
      return moment(time).isBefore(Date.now().utc)
    },
  },
}
</script>

<style scoped>
section {
  padding: 2rem 0;
  margin: 2rem 0;
  border-top: 2px solid var(--bc);
}

.timeline {
  max-width: 1024px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 100%;
}

.phase {
  font-size: 14px;
  text-align: center;
  text-transform: capitalize;
}

.phase::before {
  display: block;
  content: "";
  font-size: 10px;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--bc);
  border-radius: 50%;
  margin: -2.7rem auto 1rem;
  background: var(--app-bg);
}

.done.phase::before {
  content: "\2714";
  line-height: 18px;
  color: var(--success);
  border-color: var(--success);
}

.time {
  font-size: 12px;
  color: var(--dim);
}
</style>
