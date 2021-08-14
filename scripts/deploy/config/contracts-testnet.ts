const environment = "test";

const contracts = {
    "polygonmumbai":{
        blockchainCode: "POLYGON",
        network: "polygonmumbai",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "0x9782968954A2948EB5A611235b7E3D227457DeC0", 
        lfGlobalEscrowAddress: "0xC65e549B42D956367c6A3ec2CC054D0B8856a1e9"
    },
    "binance-testnet":{
        blockchainCode: "BSC",
        network: "binance-testnet",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        lfGlobalEscrowAddress: ""

    },
    "ropsten":{
        blockchainCode: "ETH",
        network: "ropsten",
        chainId: 0,
        isTestnet: true,
        deployerAddress: "",
        lfGlobalEscrowAddress: ""
    }
};

export {environment, contracts };