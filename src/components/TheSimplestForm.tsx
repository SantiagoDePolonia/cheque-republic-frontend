import Select, { OnChangeValue } from 'react-select'
import { NETWORKS_OPTIONS } from '../constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputWrapper from './InputWrapper';

import { Erc721Standard, IPFSWrapper, Web3Connection } from '@taikai/dappkit';

type CREATING_STATE_STATUS = 'none' | 'connecting' | 'networkValidate' | 'creating_cid' | 'creating' | 'minted';
interface NetworkOption {
  value: string;
  label: string;
  chainId: string;
}

function TheSimplestForm() {
  const [network, setNetwork] = useState<NetworkOption>(NETWORKS_OPTIONS[0]);
  const [name, setName] = useState('');
  const [creatingState, setCreatingState ] = useState<CREATING_STATE_STATUS>('none');
  const web3Connection = useRef<Web3Connection>();

  const onNetworkChange = useCallback((
    newValue: OnChangeValue<NetworkOption, false>,
  ) => {
    if(newValue)
      setNetwork(newValue);
  }, []);

  const onNetworkValidate = useCallback(async () => {
    if(window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }], // chainId must be in hexadecimal numbers
      })
    }
  }, [network]);

  const onCreatingNFT = useCallback(async () => {
    if(!web3Connection.current) {
      // TODO: Error reporting
      return
    }

    /* Deploying your NFT */
    const deployer = new Erc721Standard({
      web3CustomProvider: window.ethereum,
    });

    deployer.connection.start();
    deployer.loadAbi();

    let receipt;

    receipt = await deployer.deployJsonAbi('My NFT Name', '$MyNftSymbol');
    console.log('deployed!', receipt);

    /* Using your NFT after deployment */
    const myNFT = new Erc721Standard(deployer.connection, receipt.contractAddress);

    await myNFT.loadContract();

    receipt = await myNFT.mint(await web3Connection.current.getAddress(), 1);
    console.log('Minted!', receipt);
    setCreatingState('minted');
  }, []);

  useEffect(() => {
    if (creatingState === 'connecting') {
      web3Connection.current = new Web3Connection({ 
        web3Host: 'https://mainnet.infura.io/v3/3b53db43bd164953a1b04e00eb40f0b2',
        /* privateKey: '' */
      });

      web3Connection.current.start();
      web3Connection.current.connect().then(async () => {
        if(web3Connection.current?.getAddress) {
          console.log("User address", await web3Connection.current.getAddress());
        }
        setCreatingState('networkValidate');
      });

    } else if (creatingState === 'networkValidate') {
      onNetworkValidate().then(() =>{
        setCreatingState('creating_cid');
      });
    } else if (creatingState === 'creating_cid') {
      new IPFSWrapper()
    } else if (creatingState === 'creating') {

      onCreatingNFT();
    } else if (creatingState === 'minted') {
      console.log('minted');
    }
  }, [creatingState, onNetworkChange, onNetworkValidate, onCreatingNFT])
  const handleOnClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setCreatingState('connecting');
  }, []);

  return <form>
    <Select options={NETWORKS_OPTIONS} value={network} onChange={onNetworkChange} />
    <InputWrapper>
      <input value={name} onChange={e => setName(e.target.value)} name='name'  type='text' />
    </InputWrapper>
    <InputWrapper>
      <input name='file' type='file' />
    </InputWrapper>

    <button type='submit' onClick={handleOnClick} disabled={creatingState !== 'none'}>
      CREATE YOUR NFT
    </button>
  </form>
}

export default TheSimplestForm;