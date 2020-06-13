const {spawn} = require("child_process")

module.exports.loadPolkadotRewards = async function loadPolkadotRewards({era}) {
    return new Promise((resolve, reject) => {
        const rewardsScript = spawn(
            'node',
            [
                '../api/scripts/getOldPolkadotRewardEras.js', // TODO path won't work in product
                `--currentEra=${era}`
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