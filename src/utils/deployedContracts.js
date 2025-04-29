import contracts from "../../scripts/deployed.json";

export const contractAddresses = {
  ERC721Ticket: contracts.erc721,
  StandardTicket: contracts.standard,
  SoulboundTicket: contracts.soulbound,
  RoyaltyTicket: contracts.royalty,
  DynamicTicket: contracts.dynamic
};
