# Smart Contracts For LegalFAB

## Build Instructions:

```js
 yarn
```

## configuration:

- create a new .env file from .env-example

- fill the variables:
    ```js
    INFURA_PROJECT_ID=
    MATICVIGIL_APP_ID=
    POLYGON_PRIVATE_KEY=
    MAINNET_PRIVATE_KEY=
    ETHERSCAN_API_KEY=
    POLYGONSCAN_API_KEY=
    DEPLOYER_PRIVATE_KEY=
    MAINNET_FORK=1
    ```

- Description of env variables:




## Compile the contracts:

```sh
npx hardhat compile
```

## run ganache-cli local instance:

```sh
ganache-cli -p 8545
```

## Deploy the contracts:

```sh
npx hardhat deploy-df-global-escrow --network development
```

## Test contracts:

- Ensure a local ganache or evm instance running on port 8545

```sh
ganache-cli -p 8545
```

- capture the privateKey from the console Log for ganache-cli (1st account in list)

- Run command:

```sh
npx hardhat test --network development
```

- To run a specific Test file:

```sh
npx hardhat test test/<fileName> --network development
```





//ETH
Escrow(escrowaddress).methods.fund(_refernceId, 0.25*10^18);




//ERC20
IERC20(erc20Address).methods.approve(walletAddress, 2300*10^6);
Escrow(escrowaddress).methods.fund(_refernceId, 2300*10^6);

//precision - 
