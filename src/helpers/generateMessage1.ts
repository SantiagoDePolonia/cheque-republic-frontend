import { ethers } from "ethers";

function generateMessage1(
  chequeHash: string,
  chainId: string,
  chequeContractAddress: string
) {
  return ethers.solidityPackedKeccak256(
    ["bytes32", "uint256", "address"],
    [chequeHash.toLowerCase(), parseInt(chainId), chequeContractAddress]
  );
}

export default generateMessage1;
