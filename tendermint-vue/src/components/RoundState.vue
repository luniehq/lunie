<template>
  <div class="round_state">
    <h2>Consensus Round State</h2>
    <table>
      <tr>
        <th>Height</th>
        <td>{{ roundState.Height }}</td>
      </tr>
      <tr>
        <th>Round</th>
        <td>{{ roundState.Round }}</td>
      </tr>
      <tr>
        <th>Step</th>
        <td>{{ roundState.Step }}</td>
      </tr>
      <tr>
        <th>Start Time</th>
        <td>{{ roundState.StartTime | formatDate }}</td>
      </tr>
      <tr>
        <th>Commit Time</th>
        <td>{{ roundState.CommitTime | formatDate }}</td>
      </tr>
      <tr>
        <th>Validators</th>
        <td>
          <ol>
            <li v-for="val in roundState.Validators.validators">
              <Validator
                v-bind:val="val"
                v-bind:totalVotingPower="totalVotingPower"/>
            </li>
          </ol>
        </td>
      </tr>
      <tr>
        <th>Proposal</th>
        <td>
          <BlockProposal v-bind:proposal="roundState.Proposal" />
        </td>
      </tr>

      <!-- proposal -->
      <tr>
        <th>Proposal Block</th>
        <td>
          <Block v-bind:block="roundState.ProposalBlock" />
        </td>
      </tr>
      <tr>
        <th>Proposal Block Parts Header</th>
        <td>
          <PartsHeader v-bind:parts="roundState.ProposalBlockParts"/>
        </td>
      </tr>

      <!-- locked -->
      <tr>
        <th>Locked Round</th>
        <td>{{ roundState.LockedRound }}</td>
      </tr>
      <tr>
        <th>Locked Block</th>
        <td>
          <Block v-bind:block="roundState.LockedBlock" />
        </td>
      </tr>
      <tr>
        <th>Locked Block Parts Header</th>
        <td>
          <PartsHeader v-bind:parts="roundState.LockedBlockParts" />
        </td>
      </tr>

      <!-- (last) valid -->
      <tr>
        <th>Valid Round</th>
        <td>{{ roundState.ValidRound }}</td>
      </tr>
      <tr>
        <th>Valid Block</th>
        <td>
          <Block v-bind:block="roundState.ValidBlock" />
        </td>
      </tr>
      <tr>
        <th>Valid Block Parts Header</th>
        <td>
          <PartsHeader v-bind:parts="roundState.ValidBlockParts" />
        </td>
      </tr>

      <tr>
        <th>Votes</th>
        <td>
          <ol>
            <li v-for="vote in roundState.Votes">
              <Vote v-bind:vote="vote"/>
            </li>
          </ol>
        </td>
      </tr>

      <tr>
        <th>Commit Round</th>
        <td>{{ roundState.CommitRound }}</td>
      </tr>
      <tr>
        <th>Last Commit</th>
        <td>
          <Commit v-bind:commit="roundState.LastCommit"/>
        </td>
      </tr>

      <tr>
        <th>Last Validators</th>
        <td>
          <ol>
            <li v-for="val in roundState.LastValidators.validators">
              <Validator
                v-bind:val="val"
                v-bind:totalVotingPower="totalVotingPower"/>
            </li>
          </ol>
        </td>
      </tr>

    </table>
    <p><button @click="poke()">Poke</button></p>
  </div>
</template>

<script>
import Validator from './Validator.vue'
import BlockProposal from './BlockProposal.vue'
import Block from './Block.vue'
import PartsHeader from './PartsHeader.vue'
import Commit from './Commit.vue'
import { mapGetters } from "vuex"
var methods = {
  poke() {
    this.$store.dispatch("poke", "poked")
  }
}

export default {
  computed: {
    roundState () {
      return this.$store.getters.roundState
    },
    totalVotingPower () {
      return (this.$store.getters.roundState.Validators.validators.
        map((val) => val.voting_power).
        reduce((total, vp) => total + vp)
      )
    }
  },
  components: { Validator, BlockProposal, Block, PartsHeader, Commit },
  methods: methods
}
</script>
