import Select, { OnChangeValue } from 'react-select'
import { NETWORKS_OPTIONS, WEB3_STORAGE_TOKEN } from '../constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputWrapper from './InputWrapper';
// @ts-ignore
import { Web3Storage } from 'web3.storage'

import { Erc721Standard, Web3Connection } from '@taikai/dappkit';


type CREATING_STATE_STATUS = 'none' | 'connecting' | 'networkValidate' | 'creating_cid' | 'creating' | 'minted';
interface NetworkOption {
  value: string;
  label: string;
  chainId: string;
}

interface ERC721Metadata {
  name: string;
  description: string;
  image: string;
}

function TheSimplestForm() {
  const [network, setNetwork] = useState<NetworkOption>(NETWORKS_OPTIONS[0]);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File>();
  const [cid, setCID] = useState<string>();
  const [cidMetadata, setCIDMetadata] = useState<string>();

  const [receipt, setReceipt] = useState<any>();

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

    const receiptDeploy = await deployer.deployJsonAbi('My NFT Name', '$MyNftSymbol');;

    setReceipt(receiptDeploy)

    console.log('deployed!', receiptDeploy);

    /* Using your NFT after deployment */
    const myNFT = new Erc721Standard(deployer.connection, receiptDeploy.contractAddress);

    await myNFT.loadContract();

    const receipt = await myNFT.mint(await web3Connection.current.getAddress(), 1);

    console.log(cidMetadata)
    if(cidMetadata)
      await deployer.setTokenURI(1, 'https://ipfs.io/ipfs/'+cidMetadata )

    console.log('Minted!', receipt);
  }, [cid, cidMetadata]);
  
  const onCreatingCID = useCallback(async () => {
    const storage = new Web3Storage({ token: WEB3_STORAGE_TOKEN })

    console.log(`Uploading file`)
    const cid = await storage.put([file], {wrapWithDirectory: false})

    console.log('Content added with CID:', cid)
    setCID(cid);
    console.log("cid",cid)

    const metadataJson: ERC721Metadata = {
      name: name,
      description: name,
      image: 'https://ipfs.io/ipfs/'+cid
    }

    const fileMetadata = new Blob([JSON.stringify(metadataJson)], { type : 'plain/text' });
    const fileMetadataFile = new File([fileMetadata], 'metadata.json');

    const cidMetadata = await storage.put([fileMetadataFile], {wrapWithDirectory: false})
    console.log("cidMetadata",cidMetadata)

    setCIDMetadata(cidMetadata);

    setCreatingState('creating');
  }, [file]);

  useEffect(() => {
    if (creatingState === 'connecting') {
      web3Connection.current = new Web3Connection({ 
        web3Host: 'https://mainnet.infura.io/v3/3b53db43bd164953a1b04e00eb40f0b2',
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
      onCreatingCID().then(() => {
        setCreatingState('creating');
      });
    } else if (creatingState === 'creating') {
      onCreatingNFT().then(() => {
        setCreatingState('minted');
      });
    } else if (creatingState === 'minted') {
      console.log('minted');
    }
  }, [creatingState, onNetworkChange, onNetworkValidate, onCreatingNFT, onCreatingCID])
  const handleOnClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setCreatingState('connecting');
  }, []);
  const handleOnFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>)=> {
    if((e.target as HTMLInputElement).files?.[0]) {
      setFile((e.target as HTMLInputElement)?.files?.[0]);
    }
  },[]);

  if(creatingState === 'minted') {
    const blockchainExplorer = 'https://sepolia.etherscan.io/token/' + receipt.contractAddress;
    return (<div className='congratulations'>
      <h2>Your NFT has been minted!</h2>
      <p className='status'>
        NFT Address: {receipt.contractAddress}<br />
        Blockchain Explorer: <a href={blockchainExplorer} target='_blank' rel='noreferrer'>
          {blockchainExplorer}
        </a>
      </p>
    </div>)
  }

  if(creatingState !== 'none') {
    return (<>
      <div className='spinner'></div>
      <div className='status'>{creatingState}...</div>
    </>)
  }

  return <form>
    <Select options={NETWORKS_OPTIONS} value={network} onChange={onNetworkChange} />
    <InputWrapper>
      <input value={name} onChange={e => setName(e.target.value)} name='name'  type='text' />
    </InputWrapper>
    <InputWrapper>
      <input name='file' type='file' onChange={handleOnFileChange} />
    </InputWrapper>

    <button type='submit' onClick={handleOnClick} disabled={creatingState !== 'none' || !name || !file || !network }>
      CREATE YOUR NFT
    </button>
  </form>
}

export default TheSimplestForm;