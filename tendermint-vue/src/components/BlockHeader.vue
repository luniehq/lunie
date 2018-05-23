<template>
  <div class="block-header">
    <table>
      <tr>
        <th>ChainID</th>
        <td>{{ header.chain_id }}</td>
      </tr>
      <tr>
        <th>Height</th>
        <td>{{ header.height }}</td>
      </tr>
      <tr>
        <th>Time</th>
        <td>{{ header.time | formatDate }}</td>
      </tr>
      <tr>
        <th>Last BlockID</th>
        <td>
          <BlockID v-bind:blockID="header.last_block_id" />
        </td>
      </tr>
      <tr>
        <th>Txs</th>
        <td>
          {{ header.num_txs }} (total: {{ header.total_txs }})
        </td>
      </tr>
      <tr>
        <th>Last Commit Hash</th>
        <td class="bytes">{{ header.last_commit_hash }}</td>
      </tr>
      <tr>
        <th>Consensus Hash</th>
        <td class="bytes">{{ header.consensus_hash }}</td>
      </tr>
      <tr>
        <th>App Hash</th>
        <td class="bytes">{{ header.app_hash }}</td>
      </tr>
      <tr>
        <th>Last Results Hash</th>
        <td class="bytes">{{ header.last_results_hash }}</td>
      </tr>
      <tr>
        <th>Evidence Hash</th>
        <td class="bytes">{{ header.evidence_hash }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import BlockID from './BlockID.vue'
export default {
  props: ['header'],
  components: { BlockID }
}
</script>
