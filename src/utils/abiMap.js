// Import ABI JSON artifacts for each ticket contract
import StandardABI from "../../artifacts/contracts/StandardTicket.sol/StandardTicket.json";
import SoulboundABI from "../../artifacts/contracts/SoulboundTicket.sol/SoulboundTicket.json";
import RoyaltyABI from "../../artifacts/contracts/RoyaltyTicket.sol/RoyaltyTicket.json";
import DynamicABI from "../../artifacts/contracts/DynamicTicket.sol/DynamicTicket.json";

// Map contract names to their respective ABI definitions
// This is used to dynamically instantiate contracts using ethers.js
export const abiMap = {
  StandardTicket: StandardABI.abi,
  SoulboundTicket: SoulboundABI.abi,
  RoyaltyTicket: RoyaltyABI.abi,
  DynamicTicket: DynamicABI.abi
};
