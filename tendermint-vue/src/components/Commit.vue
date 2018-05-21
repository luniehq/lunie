<template>
  <div v-if="commit != null && commit.precommits != null && commit.precommits.length > 0" class="commit">
    <table>
      <tr>
        <th>BlockID</th>
        <td>
          <BlockID v-bind:blockID="commit.blockID" />
        </td>
      </tr>
      <tr>
        <th>Precommits</th>
        <td>
          <ol>
            <li v-for="precommit in commit.precommits">
              <Vote v-bind:vote="precommit"/>
            </li>
          </ol>
        </td>
      </tr>
    </table>
  </div>
  <div v-else>
    No Commit
  </div>
</template>

<script>
import BlockID from './BlockID.vue'
import Vote from './Vote.vue'
export default {
  props: ['commit'],
  components: { BlockID, Vote }
}
</script>
