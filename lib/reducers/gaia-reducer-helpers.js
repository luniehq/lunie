const BigNumber = require('bignumber.js')

function proposalBeginTime(proposal) {
    switch (proposal.proposal_status.toLowerCase()) {
        case 'depositperiod':
            return proposal.submit_time
        case 'votingperiod':
            return proposal.voting_start_time
        case 'passed':
        case 'rejected':
            return proposal.voting_end_time
    }
}

function proposalEndTime(proposal) {
    switch (proposal.proposal_status.toLowerCase()) {
        case 'depositperiod':
            return proposal.voting_start_time
        case 'votingperiod':
        // the end time lives in the past already if the proposal is finalized
        case 'passed':
        case 'rejected':
            return proposal.voting_end_time
    }
}

function atoms(nanoAtoms) {
    return BigNumber(nanoAtoms)
        .div(1000000)
        .toFixed(6)
}

// reduce deposits to one number and filter by required denom
function getDeposit(proposal, bondDenom) {
    return atoms(
        proposal.total_deposit.reduce(
            (sum, cur) => sum.plus(cur.denom === bondDenom ? cur.amount : 0),
            BigNumber(0)
        )
    )
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
    // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
    if (['Passed', 'Rejected'].indexOf(proposal.proposal_status) !== -1) return -1
    if (totalVoted.eq(0)) return 0
    if (!totalBondedTokens) return -1
    return BigNumber(totalBondedTokens)
        .div(atoms(totalVoted))
        .toNumber()
}

function getValidatorStatus(validator) {
    if (validator.status === 2) {
        return {
            status: 'ACTIVE',
            status_detailed: 'active'
        }
    }
    if (
        validator.signing_info &&
        new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
    ) {
        return {
            status: 'INACTIVE',
            status_detailed: 'banned'
        }
    }

    return {
        status: 'INACTIVE',
        status_detailed: 'inactive'
    }
}

module.exports = {
    atoms,
    proposalBeginTime,
    proposalEndTime,
    getDeposit,
    getTotalVotePercentage,
    getValidatorStatus
}
