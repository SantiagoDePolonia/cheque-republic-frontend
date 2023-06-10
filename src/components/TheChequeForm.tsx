import Select, { OnChangeValue } from 'react-select'
import { DEFAULT_DECIMALS_SUFFIX, ERC20_ABI, NETWORKS_OPTIONS } from '../constants';
import { useCallback, useEffect, useState } from 'react';
import InputWrapper from './InputWrapper';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { usePrepareContractWrite } from 'wagmi'
import generateChequeHash from '../helpers/generateChequeHash';
import ReactDatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import generateMessage1 from '../helpers/generateMessage1';
import generateMessage2 from '../helpers/generateMessage2';

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
}

function TheChequeForm({setChequeURL}:TheChequeFormProps) {
  const [network, setNetwork] = useState<NetworkOption>(NETWORKS_OPTIONS[0]);
  const [token, setToken] = useState(network.tokens[0]);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<string>("1");
  const [expiration, setExpiration] = useState<Date | null>(new Date());
  const amountWithSuffix = amount+DEFAULT_DECIMALS_SUFFIX;
  const [ sig1, setSig1 ] = useState<string>();
  const [ sig2, setSig2 ] = useState<string>();

  const [state, setState] = useState<SUBMIT_STATE>('init');

  const { isConnected, address } = useAccount();
    
  const {data: myAllowance, isLoading: isLoadingAddAllowanceWriteContract} = useContractRead({
    address: token.value as any,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [(address || '').toLowerCase(), network.contractAddress],
  })

  const { config, error: error1 } = usePrepareContractWrite({
    address: token.value as any,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [network.contractAddress, "0xfffffffffffffffffffffffffffff"],
  })

  const { write, error: error2 } = useContractWrite(config)

  useEffect(()=> {
    if(state === 'allowance_check') {
      console.log("myAllowance", myAllowance, write, error1, error2);
      if(myAllowance == 0n){
        console.log("WRITE")
        write?.()
      } else if(!isLoadingAddAllowanceWriteContract) {
        setState('generate_sig1')
      }
    }
  
  }, [state, myAllowance, write, error1, error2])

  useEffect(() => {
    if(state === 'issue_cheque') {
      window.location.origin
      setChequeURL(`${window.location.origin}/withdraw?sig1=${sig1}&sig2=${sig2}&expiration=${dateToTimestamp(expiration)}&amount=${amountWithSuffix}&name=${name}&networkChainId=${network.chainId}&tokenAddress=${token.value}&drawer=${address?.toLowerCase()}`)
    }
  }, [state, sig1, sig2, setChequeURL, expiration, amountWithSuffix, name, network.chainId, token.value, address])

  useEffect(() => {
    if(state === 'generate_sig1') {
      // signMessage1
      const chequeHash = generateChequeHash(token.value, amountWithSuffix, dateToTimestamp(expiration), name, (address || '').toLowerCase()).toLowerCase();
      const messageToSign = generateMessage1(chequeHash, String(network.chainId), network.contractAddress);
      window.ethereum?.request?.({ method: 'personal_sign', params: [messageToSign, address?.toLowerCase()] }).then(message => {
        setSig1(message)
        setState('generate_sig2')
      })
  
    }
  }, [state])

  useEffect(() => {
    if(state === 'generate_sig2') {
      // signMessage2

      const chequeHash = generateChequeHash(token.value, amountWithSuffix, dateToTimestamp(expiration), name, (address || '').toLowerCase());
      const messageToSign = generateMessage2(token.value, chequeHash, amountWithSuffix, dateToTimestamp(expiration), name, (address || '').toLowerCase(), network.contractAddress);
      window.ethereum?.request?.({ method: 'personal_sign', params: [messageToSign, address?.toLowerCase()] }).then(message => {
        setSig2(message)
        setState('issue_cheque')
      })
    }
  }, [state, address])


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

  const disableSubmitButton = !name || !network || !token || !amount || !expiration || !isConnected || isLoadingAddAllowanceWriteContract;
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