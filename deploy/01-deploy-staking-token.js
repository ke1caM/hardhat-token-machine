const { developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    let waitConfirmations
    if (developmentChains.includes(network.name)) {
        waitConfirmations = 1
    } else {
        waitConfirmations = 6
    }

    let args = []
    log("Deploying Staking Token Contract...")
    const stakingToken = await deploy("StakingToken", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: waitConfirmations,
    })
    log("Deployed!!!")
    log("-------------------------")
}

module.exports.tags = ["all", "token"]
