import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { CHEQUE_REPUBLIC_ABI } from "../constants";
import { encodeBytes32String, keccak256 } from "ethers";
import InputWrapper from "./InputWrapper";

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
  setPayee: (payee: string) => void;
}

function MakeWithdrawal({contractAddress, chequeHash, drawer, sig2, payee, expiration, amount, tokenAddress, name, setPayee}:CommitWithdrawalProps) {

  const {config} = usePrepareContractWrite({
    address: contractAddress,
    abi: CHEQUE_REPUBLIC_ABI,
    functionName: 'withdraw',

    args: [ 
      chequeHash,
      drawer,
      tokenAddress,
      amount,
      expiration,
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
      <InputWrapper>
        <label htmlFor='payee'>Payee (address to pay issued amount)</label>
        <input type='text' value={payee} onChange={(e) => setPayee(e.target.value.toLowerCase())}/>
      </InputWrapper>

    <button onClick={handleClickWithdraw}>Withdraw</button>
  </>)
}


export default MakeWithdrawal;