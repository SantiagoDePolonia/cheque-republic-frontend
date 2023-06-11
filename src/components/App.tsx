import TheChequeForm from './TheChequeForm';

import './App.css'
import MainContainer from './MainContainer';

import { useAccount, useConnect } from 'wagmi'
import TheChequeToPrint from './TheChequeToPrint';
import { useState } from 'react';
import WithdrawCheque from './WithdrawCheque';
import { InjectedConnector } from 'wagmi/connectors/injected';

function App() {
  const [chequeURL, setChequeURL] = useState('')
  const isWithdraw = window.location.pathname.startsWith('/withdraw');
  const { isConnected } = useAccount();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  if(!isConnected) {
    return (<MainContainer>
      <button onClick={() => connect()}>Connect Wallet</button>
    </MainContainer>);
  }
  if(isWithdraw) {
    return (<MainContainer>
      <WithdrawCheque />
    </MainContainer>);
  }

  if(chequeURL) {
    return <TheChequeToPrint chequeURL={chequeURL} />
  }

  return (
    <MainContainer>
      <TheChequeForm setChequeURL={setChequeURL} />
    </MainContainer>
  )
}

export default App
