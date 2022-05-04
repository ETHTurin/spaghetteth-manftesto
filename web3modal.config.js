import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Web3Modal from "web3modal";

const INFURA_ID = "27b6aca4f2c94025ae9afa7278badb31";
export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID,
      rpc: {
        100: "https://rpc.gnosischain.com/",
      },
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "SpaghettETH MaNFTesto", // Required
      rpc: "https://rpc.gnosischain.com/", // Optional if `infuraId` is provided; otherwise it's required
      chainId: 100, // Optional. It defaults to 1 if not provided
    },
  },
};

export let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions, // required
  });
}
