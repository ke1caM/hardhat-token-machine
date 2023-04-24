const developmentChains = ["hardhat", "localhost"]

const networkConfig = {
    31337: {
        name: "localhost",
        stakingTokenAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
    11155111: {
        name: "sepolia",
        stakingTokenAddress: "0xc8D6FEA8d32fcBE4BD93184E6473a544AF827f16",
    },
    5: {
        name: "goerli",
        stakingTokenAddress: "0x2954a34504417fdd15087edac78bff1efff344dc",
    },
}

module.exports = { developmentChains, networkConfig }
