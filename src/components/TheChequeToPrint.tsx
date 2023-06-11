import QRCode from "react-qr-code";

import './TheChequeToPrint.css';
import { DEFAULT_DECIMALS_SUFFIX } from "../constants";
interface TheChequeToPrintProps {
  chequeURL: string;
}

function TheChequeToPrint({chequeURL}: TheChequeToPrintProps) {
  const url = new URL(chequeURL);
  const amount =   url.searchParams.get('amount')?.replace(DEFAULT_DECIMALS_SUFFIX, '');
  const name = url.searchParams.get('name')?.replace(DEFAULT_DECIMALS_SUFFIX, '');

  console.log("chequeURL", chequeURL)
  return (<div className='cheque-to-print'>
    <div className='cheque-frame'>
      <div className='details'>
        <div className='header'>
          <img src='/logo.png' alt='logo' width={50}  />
          <h3>Cheque Republic (trustless smart contract)</h3>
        </div>
        <p>is obligated to pay</p>
        <div>Amount: {amount} USDT</div>
        <p>to the account indicated by the owner of this cheque with</p>
        <div className='name'>Name: {name}</div>
      </div>
      <QRCode value={chequeURL} />
    </div>
  </div>);
}

export default TheChequeToPrint;