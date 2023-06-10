import { NETWORKS_OPTIONS } from "../constants";
import { useMemo, useState } from "react";
import generateChequeHash from "../helpers/generateChequeHash";
import { useAccount } from "wagmi";
import CommitWithdrawal from "./CommitWithdrawal";
import MakeWithdrawal from "./MakeWithdrawal";
import TransactionWaitingWrapper from "./TransactionWaitingWrapper";

function WithdrawCheque() {
  const [status, setStatus] = useState<'sig1' | 'sig2'>('sig1')
  const [transactionToWaitFor, setTransactionToWaitFor] = useState<string>()

  const {address} = useAccount()

  const [payee, setPayee] = useState<string>(address?.toLowerCase())

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

  if(status=== 'sig1') {
    return <CommitWithdrawal
      contractAddress={contractAddress}
      chequeHash={chequeHash}
      drawer={drawer || ''}
      payee={payee}
      setPayee={setPayee}
      sig1={sig1 || ''}
      next={() => setStatus('sig2')}
      setTransactionToWaitFor={setTransactionToWaitFor}
    />
  }

  return (
    <TransactionWaitingWrapper transactionToWaitFor={transactionToWaitFor}>
      <MakeWithdrawal
        contractAddress={contractAddress}
        chequeHash={chequeHash}
        drawer={drawer || ''}
        payee={payee}
        expiration={expiration || ''}
        amount={amount || ''}
        tokenAddress={tokenAddress || ''}
        name={name || ''}
        sig2={sig2 || ''}
      />
    </TransactionWaitingWrapper>);
}

export default WithdrawCheque;