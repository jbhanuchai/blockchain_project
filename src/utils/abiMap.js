import ERC721ABI from "../../artifacts/contracts/ERC721Ticket.sol/ERC721Ticket.json";
import StandardABI from "../../artifacts/contracts/StandardTicket.sol/ERC721Ticket.json";
import SoulboundABI from "../../artifacts/contracts/SoulboundTicket.sol/SoulboundTicket.json";
import RoyaltyABI from "../../artifacts/contracts/RoyaltyTicket.sol/RoyaltyTicket.json";
import DynamicABI from "../../artifacts/contracts/DynamicTicket.sol/DynamicTicket.json";

export const abiMap = {
  ERC721Ticket: ERC721ABI.abi,
  StandardTicket: StandardABI.abi,
  SoulboundTicket: SoulboundABI.abi,
  RoyaltyTicket: RoyaltyABI.abi,
  DynamicTicket: DynamicABI.abi
};
