import { ethers } from "ethers";

function generateMessage2(
  tokenAddress: string,
  chequeHash: string,
  value: string,
  expiration: string,
  name: string,
  signerAddress: string,
  chequeContractAddress: string
) {
  return ethers.solidityPackedKeccak256(
    [
      "address",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "address",
      "address",
    ],
    [
      tokenAddress,
      chequeHash,
      value,
      expiration,
      ethers.keccak256(ethers.encodeBytes32String(name)),
      signerAddress,
      chequeContractAddress,
    ]
  );
}

export default generateMessage2;
