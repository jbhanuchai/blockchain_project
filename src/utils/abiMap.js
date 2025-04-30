
import StandardABI from "../../artifacts/contracts/StandardTicket.sol/StandardTicket.json";

import SoulboundABI from "../../artifacts/contracts/SoulboundTicket.sol/SoulboundTicket.json";
import RoyaltyABI from "../../artifacts/contracts/RoyaltyTicket.sol/RoyaltyTicket.json";
import DynamicABI from "../../artifacts/contracts/DynamicTicket.sol/DynamicTicket.json";

export const abiMap = {
  StandardTicket: StandardABI.abi,
  SoulboundTicket: SoulboundABI.abi,
  RoyaltyTicket: RoyaltyABI.abi,
  DynamicTicket: DynamicABI.abi
};
