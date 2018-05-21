<template>
  <div v-if="block != null" class="block">
    <table>
      <tr>
        <th>Header</th>
        <td>
          <BlockHeader v-bind:header="block.header" />
        </td>
      </tr>
      <tr>
        <th>Txs</th>
        <td>
          <ol>
            <li v-for="tx in block.data.txs">
              <span class="bytes">{{ tx }}</span>
            </li>
          </ol>
        </td>
      </tr>
      <tr>
        <th>Evidences</th>
        <td>
          <ol>
            <li v-for="evidence in block.evidence">
              <span class="bytes">{{ evidence }}</span>
            </li>
          </ol>
        </td>
      </tr>
      <tr>
        <th>Last Commit</th>
        <td>
          <Commit v-bind:commit="block.last_commit"/>
        </td>
      </tr>
    </table>
  </div>
  <div v-else>
    No Block
  </div>
</template>

<script>
import BlockID from './BlockID.vue'
import BlockHeader from './BlockHeader.vue'
import Commit from './Commit.vue'
export default {
  props: ['block'],
  components: { BlockID, BlockHeader, Commit }
}
</script>
