<template>
  <div class="vote">
    <table v-if="vote != null">
      <tr>
        <th>Address</th>
        <td class="bytes">
          {{ vote.validator_address }}
          (index: {{ vote.validator_index }})
        </td>
      </tr>
      <tr>
        <th>H/R/S</th>
        <td>
          {{ vote.height }}/{{ vote.round }}/{{ vote.type }}
        </td>
      </tr>
      <tr>
        <th>Timestamp</th>
        <td>
          {{ vote.timestamp | formatDate }}
        </td>
      </tr>
      <tr>
        <th>BlockID</th>
        <td>
          <BlockID v-bind:blockID="vote.block_id"/>
        </td>
      </tr>
      <tr>
        <th>Signature</th>
        <td class="bytes">
          <span v-on:click="showSig = !showSig" class="control">
            <button v-if="showSig">hide</button>
            <button v-else>show</button>
          </span>
          <span v-show="showSig">{{ vote.signature }}</span>
        </td>
      </tr>
    </table>
    <div v-else>
      No Vote
    </div>
  </div>
</template>

<script>
import BlockID from './BlockID.vue'
export default {
  props: ['vote'],
  components: { BlockID },
  data: () => ({
    showSig: false,
  })
}
</script>
