const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async function ({ getNamedAccounts, deployments, getChainId }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainId = await getChainId()

    let waitConfirmations
    if (developmentChains.includes(network.name)) {
        waitConfirmations = 1
    } else {
        waitConfirmations = 6
    }

    const tokenAddress = networkConfig[chainId].stakingTokenAddress

    let args = [tokenAddress]
    log("Deploying Token Machine Contract...")
    const tokenMachine = await deploy("TokenMachine", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: waitConfirmations,
    })
    log("Deployed!!!")
    log("-------------------------")
}

module.exports.tags = ["all", "machine"]
