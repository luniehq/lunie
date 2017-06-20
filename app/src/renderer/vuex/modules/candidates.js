const CANDIDATE_INTERVAL = 1000 // update every second

export default ({ commit, basecoin }) => {
  const state = {
    list: [],
    map: {}
  }

  const mutations = {
    updateCandidate (state, candidate) {
      // TODO: replace hardcoded defaults with real data
      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.splice(state.indexOf(
        state.find(c => c.id === candidate.id)), 1, candidate)

      commit('notifyCustom', { title: 'Nomination Updated',
        body: 'You have successfuly updated your candidacy.' })
    },
    addCandidate (state, candidate) {
      let pubkey = candidate.validatorPubKey.bytes().toString('base64')
      if (state.map[pubkey] != null) return

      Object.assign(candidate, {
        'commissionPercent': 1.05,
        'country': 'AL',
        'description': '## Mora firmat\n\nLorem markdownum terra, percussere pependit carinis miserabilis colla, inconcessaeque *Phoebo* pes! Facis sed conditor, sparsit dixit. Quae iuvenaliter tuque, [fuit neve](http://finibus-quo.io/) ore pulsa nec; annus. Loco rerumque forte naribus, in nulla iuvenem quod *vaga Isi clamare*.\n\n1. Tactu ad tum\n2. Est heros facinus\n3. Cetera metu esset tabularia collo corpus cunctisque\n4. Locus ventus descendit recurva consistuntque paene vultum\n5. Fluminis sparsit petens graviore adsit nam superstitibus',
        'id': 'john-connor',
        'ipAddress': '35.102.58.60',
        'serverPower': '\n* i3\n* 8GB DDR4 RAM\n* 240GB SSD\n* 1 GBps (down) / 1 GBPS (up)',
        'website': 'https://johncvalidator.org',
        'computed': {
          'atoms': 763344,
          'delegators': 7,
          'pubkey': 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
          'slashes': []
        }
      })

      candidate.computed = {
        delegators: 10,
        atoms: 31337,
        pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
        slashes: []
      }
      state.list.push(candidate)
      state.map[pubkey] = candidate

      // TODO: move the notification to the nomination component
      // commit('notifyCustom', { title: 'Nomination Submitted',
      //   body: 'Well done! You\'ll appear on the candidates list shortly .' })
    }
  }

  const actions = {
    async getCandidates ({ commit }) {
      let candidates = await basecoin.client.getCandidates()
      candidates.forEach((c) => commit('addCandidate', c))
    },
    startCandidateInterval ({ dispatch }) {
      setInterval(() => dispatch('getCandidates'), CANDIDATE_INTERVAL)
    }
  }

  return { state, mutations, actions }
}
