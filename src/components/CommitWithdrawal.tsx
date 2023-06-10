import { useContractWrite, usePrepareContractWrite } from "wagmi";
import InputWrapper from "./InputWrapper";
import { CHEQUE_REPUBLIC_ABI } from "../constants";
import { useEffect } from "react";

interface CommitWithdrawalProps {
  contractAddress: string;
  chequeHash: string;
  drawer: string;
  sig1: string;
  payee: string;
  setPayee: (payee: string) => void;
  next: () => void;
  setTransactionToWaitFor: (value: string) => void;
}

function CommitWithdrawal({contractAddress, chequeHash, drawer, sig1, payee, setPayee, next, setTransactionToWaitFor}:CommitWithdrawalProps) {
  const {config, error} = usePrepareContractWrite({
    address: contractAddress,
    abi: CHEQUE_REPUBLIC_ABI,
    functionName: 'commitWithdrawal',
    args: [ chequeHash, drawer, sig1, payee]
  })

  const {write, isSuccess, data: transactionNumber} = useContractWrite(config);
  const handleClickWithdraw = async () => {
    write?.()
  };

  useEffect(() => {
    if(error?.shortMessage && error.shortMessage.endsWith('Address already set')) {
      next()
    }
  }, [error])
  useEffect(()=> {
    if(isSuccess) {
      setTransactionToWaitFor(transactionNumber)
      setTimeout(() =>next(), 1000)
    }
  }, [isSuccess, next, transactionNumber]) 
  return (<>
    <InputWrapper>
      <label htmlFor='payee'>Payee (address to pay issued amount)</label>
      <input type='text' value={payee} onChange={(e) => setPayee(e.target.value.toLowerCase())}/>
    </InputWrapper>
    <button onClick={handleClickWithdraw}>Commit Withdraw</button>
  </>)
}


export default CommitWithdrawal;