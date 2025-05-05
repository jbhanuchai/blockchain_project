// Import deployed contract addresses from the JSON file generated after deployment
import contracts from "../../scripts/deployed.json";

// Map each contract type to its corresponding deployed address
// This allows the frontend to interact with the correct contract instance on the blockchain
export const contractAddresses = {
  StandardTicket: contracts.standard,
  SoulboundTicket: contracts.soulbound,
  RoyaltyTicket: contracts.royalty,
  DynamicTicket: contracts.dynamic
};
