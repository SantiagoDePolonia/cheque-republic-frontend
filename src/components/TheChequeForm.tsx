import Select, { OnChangeValue } from 'react-select'
import { ERC20_ABI, NETWORKS_OPTIONS } from '../constants';
import { useCallback, useEffect, useState } from 'react';
import InputWrapper from './InputWrapper';
import { useAccount, useConnect, useContractRead, useContractWrite, useNetwork, useSignMessage } from 'wagmi';
import { usePrepareContractWrite } from 'wagmi'
import generateChequeHash from '../helpers/generateChequeHash';
import ReactDatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import generateMessage1 from '../helpers/generateMessage1';
import generateMessage2 from '../helpers/generateMessage2';
import { ConnectArgs } from 'wagmi/actions';
function dateToTimestamp(date:Date | null) {
  return date ? String(Math.ceil(date?.getTime()/1000)) : "0";
}

interface TokenOption {
  label: string,
  value: string,
}

interface NetworkOption {
  value: string;
  label: string;
  chainId: string;
  contractAddress: string,
  tokens: TokenOption[],
}
type SUBMIT_STATE = 'init' | 'allowance_check' | 'generate_sig1' | 'generate_sig2' | 'issue_cheque';

interface TheChequeFormProps {
  setChequeURL: (chequeURL: string) => void;
  connect: (args?: Partial<ConnectArgs> | undefined) => void

}

function TheChequeForm({setChequeURL, connect}:TheChequeFormProps) {
  const [network, setNetwork] = useState<NetworkOption>(NETWORKS_OPTIONS[0]);
  const [token, setToken] = useState(network.tokens[0]);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>("1");
  const [expiration, setExpiration] = useState<Date | null>(new Date());

  const [sig1, setSig1] = useState<string>();
  const [sig2, setSig2] = useState<string>();
  const { data: data1, isLoading: signIsLoading1, signMessage: signMessage1, variables: variables1 } = useSignMessage()
  const { data: data2, isLoading: signIsLoading2, signMessage: signMessage2, variables: variables2 } = useSignMessage()

  const [state, setState] = useState<SUBMIT_STATE>('init');

  const { isConnected, address } = useAccount();
  const connectedNetwork = useNetwork()
    
  // generateChequeHash(token.value, amount, expiration ? dateToTimestamp(expiration) : "0", name, address)
  useEffect(()=> {
    if(!isConnected || String(network.chainId) !== String(connectedNetwork.chain?.id)) connect()
  }, [network.value, connectedNetwork.chain?.id]);
  const {data: myAllowance, isLoading} = useContractRead({
    address: token.value as any,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, network.contractAddress],
  })

  useEffect(() => {
    if(state === 'allowance_check') {
      if(myAllowance === 0n){
        write && write()
      } else if(!isLoading) {
        setState('generate_sig1')
      }
    }
  }, [state, myAllowance, isLoading])

  useEffect(() => {
    if(state === 'issue_cheque') {
      window.location.origin
      setChequeURL(`${window.location.origin}/withdraw?sig1=${sig1}&sig2=${sig2}&expiration=${dateToTimestamp(expiration)}&amount=${amount}&name=${name}&networkChainId=${network.chainId}&tokenAddress=${token.value}&drawer=${address}`)
    }
  }, [state])

  useEffect(() => {
    if(state === 'generate_sig1') {
      // signMessage1
      const chequeHash = generateChequeHash(token.value, amount, dateToTimestamp(expiration), name, address);
      const messageToSign = generateMessage1(chequeHash, String(network.chainId), network.contractAddress);
      if(!signIsLoading1 && !variables1?.message) {
        signMessage1({message: messageToSign});
      }else if (variables1?.message && data1) {
        setSig1(data1)
        setState('generate_sig2')
      }
    }
  }, [state, data1, variables1?.message])

  useEffect(() => {
    if(state === 'generate_sig2') {
      // signMessage2
      const chequeHash = generateChequeHash(token.value, amount, dateToTimestamp(expiration), name, address);
      const messageToSign = generateMessage2(token.value, chequeHash, amount, dateToTimestamp(expiration), name, address, network.contractAddress);
      if(!signIsLoading2 && !variables2?.message) {
        signMessage2({message: messageToSign});
      }else if (variables2?.message && data2) {
        setSig2(data2)
        setState('issue_cheque')
      }
    }
  }, [state, data2, variables2?.message])


  const { config, error } = usePrepareContractWrite({
    address: token.value as any,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [network.contractAddress, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"],
  })

  const { write } = useContractWrite(config)

  const onNetworkChange = useCallback((
    newValue: OnChangeValue<NetworkOption, false>,
  ) => {
    if(newValue) setNetwork(newValue);
  }, []);

  const onTokenChange = useCallback((
    newValue: OnChangeValue<TokenOption, false>,
  ) => {
    if(newValue)
      setToken(newValue);
  }, []);

  const handleOnClickGenerateCheque = (e) => {
    e.preventDefault();
    setState('allowance_check');
  };
  const disableSubmitButton = !name || !network || !token || !amount || !expiration || !isConnected || isLoading;
  console.log("state", state);
  return <form>
    <InputWrapper>
      <label>Network</label>
      <Select options={NETWORKS_OPTIONS} value={network} onChange={onNetworkChange} />
    </InputWrapper>

    <InputWrapper>
      <label>Token</label>
      <Select name='token' value={token} options={network.tokens} onChange={onTokenChange}/>
    </InputWrapper>

    <InputWrapper>
      <label>Amount</label>
      <input value={amount} type='number' name='amount' onChange={(e) => setAmount(String(e.target.value))} />
    </InputWrapper>

    <InputWrapper>
      <label>Expiration Date</label>
      <ReactDatePicker
        selected={expiration}
        onChange={(date) => setExpiration(date)}
      />
    </InputWrapper>

    <InputWrapper>
      <label>Payee name</label>
      <input value={name} onChange={e => setName(e.target.value.toUpperCase())} name='name' type='text' placeholder="Payee name..." />
    </InputWrapper>

    <button type='submit' onClick={handleOnClickGenerateCheque} disabled={disableSubmitButton}>
      Generate Cheque
    </button>
  </form>
}

export default TheChequeForm;