import { ethers } from "ethers";

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed.");
    return null;
  }

  try {
    // Request wallet access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    // Setup provider and signer (ethers v5 syntax)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    return {
      address: accounts[0],
      provider,
      signer,
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    return null;
  }
}
