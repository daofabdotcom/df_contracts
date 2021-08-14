const environment = "production";

const contracts = {
    "polygonmainnet":{
        blockchainCode: "POLYGON",
        network: "polygonmumbai",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "", 
        lfGlobalEscrowAddress: ""
    },
    "binancemainnet":{
        blockchainCode: "BSC",
        network: "binancemainnet",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        lfGlobalEscrowAddress: ""

    },
    "ethmainnet":{
        blockchainCode: "ETH",
        network: "mainnet",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        lfGlobalEscrowAddress: ""
    }
};

export {environment, contracts };