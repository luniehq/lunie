<template>
  <div class="validator">
    <table>
      <tr>
        <th>Address</th>
        <td class="bytes">{{ val.address }}</td>
      </tr>
      <tr>
        <th>Pub-Key</th>
        <td class="bytes">{{ val.pub_key.type }}:{{ val.pub_key.value }}</td>
      </tr>
      <tr>
        <th>Voting Power</th>
        <td>{{ val.voting_power }} (accum:{{ val.accum }})<br/>
          <progress-bar type="line" ref="line" :options="options"></progress-bar>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: ['val', 'totalVotingPower'],
  computed: {
    options: () => ({
      color: '#007AFF',
      strokeWidth: 1,
    })
  },
  mounted: function () {
    let ratio = this.val.voting_power / this.totalVotingPower
    this.$refs.line.animate(ratio)
  }
}
</script>
