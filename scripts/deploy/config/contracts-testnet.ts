const environment = "test";

const contracts = {
    "mumbai":{
        blockchainCode: "POLYGON",
        network: "mumbai",
        chainId: 80001,
        isTestnet: true,
        deployerAddress: "", 
        dfGlobalEscrowAddress: "0x4a8501d6eEB1bf2B3e4E8AdcB1b624c0CEb4a0f1"
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
        dfGlobalEscrowAddress: "0x1B3B2cd2C6a8f29E3BfC6F68b4C67Bae90e5be19"
    }
};

export {environment, contracts };