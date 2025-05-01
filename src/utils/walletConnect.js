import { ethers } from "ethers";

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed.");
  }

  try {
    // Request wallet access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please ensure MetaMask is unlocked and an account is selected.");
    }

    // Setup provider and signer (ethers v5 syntax)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    console.log("Wallet connected successfully:", accounts[0]);

    return {
      address: accounts[0],
      provider,
      signer,
    };
  } catch (error) {
    console.error("Wallet connection error:", error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
}