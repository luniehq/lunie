<template>
  <ul class="timeline">
    <li v-for="phase in timeline" :key="phase.title" class="phase">
      <h4>{{ phase.title }}</h4>
      <span>{{ phase.date }}</span>
    </li>
  </ul>
</template>

<script>
export default {
	name: `timeline`,
  data: () => ({
		timeline: [
			{
				title: `Created`,
				date: `July 12th, 2020`,
				completed: true
			},
			{
				title: `Deposit Period`,
				date: `July 12th, 2020`,
				completed: true
			},
			{
				title: `Voting Period`,
				date: `July 12th, 2020`,
				completed: true
			},
			{
				title: `Decision`,
				date: `July 26th, 2020 @ 21:37`,
				completed: false
			},
		]
  }),
}
</script>

<style scoped>
.timeline {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
