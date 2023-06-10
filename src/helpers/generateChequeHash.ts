import { ethers } from "ethers";

function generateChequeHash(
  erc20TokenAddress: string,
  value: string,
  expiration: string,
  name: string,
  signerAddress: string
): string {
  return ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256", "address"],
    [
      erc20TokenAddress,
      value,
      expiration,
      ethers.keccak256(ethers.encodeBytes32String(name)),
      signerAddress,
    ]
  );
}
export default generateChequeHash;
