import { ReactNode } from "react";
import { useWaitForTransaction } from "wagmi";

interface TransactionWaitingWrapperProps {
  children: ReactNode;
  transactionToWaitFor: string;
}
function TransactionWaitingWrapper({children, transactionToWaitFor}: TransactionWaitingWrapperProps) {
  const {  isLoading } = useWaitForTransaction({
    hash: transactionToWaitFor,
  })
 
  if (isLoading && transactionToWaitFor) return <div>Processing…</div>
  // if (isError) return <div>Transaction error</div>
  return <>{children}</>
}

export default TransactionWaitingWrapper;