import TheChequeForm from './TheChequeForm';

import './App.css'
import MainContainer from './MainContainer';

import { useConnect } from 'wagmi'
import TheChequeToPrint from './TheChequeToPrint';
import { useState } from 'react';
import WithdrawCheque from './WithdrawCheque';
import { InjectedConnector } from 'wagmi/connectors/injected';

function App() {
  const [chequeURL, setChequeURL] = useState('')
  const isWithdraw = window.location.pathname.startsWith('/withdraw');

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })

  return (
    <MainContainer>
    {isWithdraw ? <WithdrawCheque connect={connect} /> :
      (chequeURL ? <TheChequeToPrint chequeURL={chequeURL} /> :
      <TheChequeForm setChequeURL={setChequeURL} connect={connect} />)} 
    </MainContainer>
  )
}

export default App
