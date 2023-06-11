import { useContractWrite, usePrepareContractWrite } from "wagmi";
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
    address: contractAddress as any,
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

  const {write, isSuccess} = useContractWrite(config);

  const handleClickWithdraw = async () => {
    write?.()
  };

  if(isSuccess) {
    return (<div>
      <img src='/logo.png' alt='logo' width={50}  />
      <h4>Your cheque has been successfully used!</h4>
    </div>);
  }

  return (<>
    <InputWrapper>
      <label htmlFor='payee'>Payee (address to pay issued amount)</label>
      <input type='text' value={payee} onChange={(e) => setPayee(e.target.value.toLowerCase())}/>
    </InputWrapper>

    <button onClick={handleClickWithdraw}>Withdraw</button>
  </>)
}


export default MakeWithdrawal;