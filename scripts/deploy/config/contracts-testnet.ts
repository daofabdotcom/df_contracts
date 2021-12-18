const environment = "test";

const contracts = {
    "polygonmumbai":{
        blockchainCode: "POLYGON",
        network: "polygonmumbai",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "0x9782968954A2948EB5A611235b7E3D227457DeC0", 
        dfGlobalEscrowAddress: "0x369d514D287a05Cf644546D0dFd47444348a59c8"
    },
    "binance-testnet":{
        blockchainCode: "BSC",
        network: "binance-testnet",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        dfGlobalEscrowAddress: ""

    },
    "rinkeby":{
        blockchainCode: "ETH",
        network: "ropsten",
        chainId: 4,
        isTestnet: true,
        deployerAddress: "0x2Bbe50113D8114EECf33bc4aA8CBF02CA1ef1f5A",
        dfGlobalEscrowAddress: "0x866EEfB088f2B05a1CFc9282932882dC98fd29A8"
    }
};

export {environment, contracts };