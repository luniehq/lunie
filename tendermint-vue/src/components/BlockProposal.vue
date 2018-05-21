<template>
  <div class="block-proposal">
    <table>
      <tr>
        <th>Height</th>
        <td>{{ proposal.height }}</td>
      </tr>
      <tr>
        <th>Round</th>
        <td>{{ proposal.round }}</td>
      </tr>
      <tr>
        <th>Timestamp</th>
        <td>{{ proposal.timestamp | formatDate }}</td>
      </tr>
      <tr>
        <th>Block Parts Header</th>
        <td>
          <PartsHeader v-bind:parts="proposal.block_parts_header"/>
        </td>
      </tr>
      <tr>
        <th>Proof-of-Lock</th>
        <td>
          <BlockID v-bind:blockID="proposal.pol_block_id" />
          (round: {{ proposal.pol_round }})
        </td>
      </tr>
      <tr>
        <th>Signature</th>
        <td class="bytes">
          <span v-on:click="showSig = !showSig" class="control">
            <button v-if="showSig">hide</button>
            <button v-else>show</button>
          </span>
          <span v-show="showSig">{{ proposal.signature }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import BlockID from './BlockID.vue'
import PartsHeader from './PartsHeader.vue'
export default {
  props: ['proposal'],
  components: { BlockID, PartsHeader },
  data: () => ({
    showSig: false,
  })
}
</script>
