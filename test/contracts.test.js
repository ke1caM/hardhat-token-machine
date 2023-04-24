const { expect } = require("chai")
const hre = require("hardhat")

const tokens = (token) => {
    return hre.ethers.utils.parseEther(token, "ether")
}

describe("StakingToken", () => {
    it("Should deploy correctly", async () => {
        // Deploy Staking Token
        const StakingToken = await hre.ethers.getContractFactory("StakingToken")
        const stakingToken = await StakingToken.deploy()
        expect(await stakingToken.name()).to.equal("StakingToken")
        expect(await stakingToken.symbol()).to.equal("STK")
        expect(await stakingToken.totalSupply()).to.equal(tokens("29000000"))
    })
})

describe("TokenMachine", () => {
    let stakingToken, tokenMachine
    beforeEach(async () => {
        accounts = await hre.ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
        user2 = accounts[2]
        user3 = accounts[3]
        user4 = accounts[4]
        // Deploy Staking Token
        const StakingToken = await hre.ethers.getContractFactory("StakingToken")
        stakingToken = await StakingToken.deploy()
        // Deploy Token Machine
        const TokenMachine = await hre.ethers.getContractFactory("TokenMachine")
        tokenMachine = await TokenMachine.deploy(stakingToken.address)

        stakingToken.connect(deployer).transfer(tokenMachine.address, tokens("28000000"))
        // console.log((await hre.ethers.provider.getBalance(deployer.address)).toString())
    })

    it("Should deploy correctly", async () => {
        expect(await tokenMachine.getStakingToken()).to.equal(stakingToken.address)
    })

    it("Should have correct staking token balance after transfer", async () => {
        expect(await stakingToken.balanceOf(tokenMachine.address)).to.equal(tokens("28000000"))
    })

    it("Should have correct BUY RATE", async () => {
        expect(await tokenMachine.getBuyRate()).to.equal("1000")
    })

    describe("buyTokens function", () => {
        it("Should work correctly with Ether sent to contract", async () => {
            await tokenMachine.connect(user).buyTokens({ value: tokens("1") })
            expect(await stakingToken.balanceOf(user.address)).to.equal(tokens("1000"))
            expect(await stakingToken.balanceOf(tokenMachine.address)).to.equal(tokens("27999000"))
            expect(
                (await hre.ethers.provider.getBalance(tokenMachine.address)).toString()
            ).to.equal(tokens("1"))
        })

        it("Should revert when zero ether was sent", async () => {
            await expect(
                tokenMachine.connect(user).buyTokens({ value: tokens("0") })
            ).to.be.revertedWith("ZeroEtherSent")
        })

        it("Should revert when transfer fails", async () => {
            // In this test we make sure contract does not have enough tokens to transfer
            // to check if it will revert the transaction
            await tokenMachine.connect(user).buyTokens({ value: tokens("8998") })
            await tokenMachine.connect(user2).buyTokens({ value: tokens("9998") })
            // We will get reverted with ERC20 string error
            await expect(
                tokenMachine.connect(user3).buyTokens({ value: tokens("9998") })
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
        })

        it("Should emit an event", async () => {
            expect(
                await tokenMachine.connect(deployer).buyTokens({ value: tokens("1") })
            ).to.emit()
        })
    })

    describe("sellTokens function", () => {
        it("Should work correctly when selling right amount of tokens", async () => {
            await tokenMachine.connect(user4).buyTokens({ value: tokens("1") })
            await stakingToken.connect(user4).approve(tokenMachine.address, tokens("1000"))
            await tokenMachine.connect(user4).sellTokens(tokens("1000"))
            expect(await stakingToken.balanceOf(tokenMachine.address)).to.equal(tokens("28000000"))
            expect(await stakingToken.balanceOf(user4.address)).to.equal("0")
        })

        it("Should revert when user tries to sell more than he has", async () => {
            await expect(
                tokenMachine.connect(user4).sellTokens(tokens("10000"))
            ).to.be.revertedWith("NotEnoughTokens")
        })

        it("Should revert when user did not approve his tokens", async () => {
            await tokenMachine.connect(user4).buyTokens({ value: tokens("1") })
            await expect(
                tokenMachine.connect(user4).sellTokens(tokens("1000"))
            ).to.be.revertedWith("NotEnoughTokensAllowed")
        })

        it("Should emit an event", async () => {
            await tokenMachine.connect(user4).buyTokens({ value: tokens("1") })
            await stakingToken.connect(user4).approve(tokenMachine.address, tokens("1000"))
            expect(await tokenMachine.connect(user4).sellTokens(tokens("1000"))).to.emit()
        })
    })
})
