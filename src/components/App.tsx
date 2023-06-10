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

  return (
    <MainContainer>
      {!isConnected ?
      <button onClick={() => connect()}>Connect Wallet</button> :
    (isWithdraw ? <WithdrawCheque connect={connect} /> :
      (chequeURL ? <TheChequeToPrint chequeURL={chequeURL} /> :
      <TheChequeForm setChequeURL={setChequeURL} connect={connect} />))} 
    </MainContainer>
  )
}

export default App
