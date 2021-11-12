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
    "ropsten":{
        blockchainCode: "ETH",
        network: "ropsten",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        dfGlobalEscrowAddress: ""
    }
};

export {environment, contracts };