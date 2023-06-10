import { ConnectArgs } from "wagmi/actions";
import { CHEQUE_REPUBLIC_ABI, NETWORKS_OPTIONS } from "../constants";
import { useMemo, useState } from "react";
import generateChequeHash from "../helpers/generateChequeHash";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

interface WithdrawChequeProps {
  connect: (args?: Partial<ConnectArgs> | undefined) => void
}
function WithdrawCheque({connect}:WithdrawChequeProps) {
  const [status, useStatue] = useState<string>('sig1')
  const searchParams = new URLSearchParams(window.location.search)
  const sig1 = searchParams.get('sig1')
  const sig2 = searchParams.get('sig2')
  const amount = searchParams.get('amount')
  const name = searchParams.get('name')
  const expiration = searchParams.get('expiration')
  const tokenAddress = searchParams.get('tokenAddress')
  const drawer = searchParams.get('drawer')

  const networkChainId = searchParams.get('networkChainId')
  const contractAddress = useMemo(()=> NETWORKS_OPTIONS.find(network => network.chainId === networkChainId), [networkChainId])?.contractAddress || ''

  const chequeHash = generateChequeHash(tokenAddress, amount, expiration, name, drawer);
  // console.log("contractAddress", contractAddress)
  const {config} = usePrepareContractWrite({
    address: contractAddress,
    abi: CHEQUE_REPUBLIC_ABI,
    functionName: 'commitWithdrawal',
    args:[ chequeHash, drawer, sig1]
  })

  const {write} = useContractWrite(config);
  // console.log("error", error1, error);
  const handleClickWithdraw = async () => {
    write && write()
  };
  
  return (<>
    <button onClick={handleClickWithdraw}>Withdraw</button>
  </>);
}

export default WithdrawCheque;