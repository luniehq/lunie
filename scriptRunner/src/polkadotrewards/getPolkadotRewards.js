const {spawn} = require("child_process")

module.exports.loadPolkadotRewards = async function loadPolkadotRewards({ era, networkId }) {
    return new Promise((resolve, reject) => {
        const rewardsScript = spawn(
            'node',
            [
                '../api/scripts/getOldPolkadotRewardEras.js', // the path is in context of scriptRunner/index.js
                `--currentEra=${era}`,
                `--network=${networkId}`
            ],
            {
                stdio: 'inherit' //feed all child process logging into parent process
            }
        )
        rewardsScript.on('close', function (code) {
            process.stdout.write(
                'rewardsScript finished with code ' + code + '\n'
            )

            if (code !== 0) {
                reject('getOldPolkadotRewardEras script failed')
            }
            resolve()
        })
    })
}