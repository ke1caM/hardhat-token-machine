const { ethers } = require("hardhat")

async function main() {
    console.log("Sending tokens to Token Machine...")
    const stakingToken = await ethers.getContract("StakingToken")
    const tokenMachine = await ethers.getContract("TokenMachine")
    const transferTx = await stakingToken.transfer(
        tokenMachine.address,
        ethers.utils.parseEther("28000000")
    )
    await transferTx.wait(1)
    console.log("Transaction sent")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
