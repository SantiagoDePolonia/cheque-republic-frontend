import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { CHEQUE_REPUBLIC_ABI } from "../constants";
import { encodeBytes32String, keccak256 } from "ethers";

interface CommitWithdrawalProps {
  contractAddress: string;
  chequeHash: string;
  drawer: string;
  sig2: string;
  payee: string;
  tokenAddress: string;
  amount: string;
  expiration:string;
  name:string;
}

function MakeWithdrawal({contractAddress, chequeHash, drawer, sig2, payee, expiration, amount, tokenAddress, name}:CommitWithdrawalProps) {

  const {config} = usePrepareContractWrite({
    address: contractAddress,
    abi: CHEQUE_REPUBLIC_ABI,
    functionName: 'withdraw',

    args: [ 
      chequeHash,
      drawer,
      tokenAddress,
      parseInt(amount),
      parseInt(expiration),
      keccak256(encodeBytes32String(name)),
      sig2,
      payee
    ]
  })

  const {write} = useContractWrite(config);

  const handleClickWithdraw = async () => {
    write?.()
  };

  // useEffect(()=> {
  //   if(isSuccess) {
  //     setTimeout(() =>next(), 10000)
  //   }
  // }, [isSuccess])

  return (<>
    <button onClick={handleClickWithdraw}>Withdraw</button>
  </>)
}


export default MakeWithdrawal;