import QRCode from "react-qr-code";

interface TheChequeToPrintProps {
  chequeURL: string;
}

function TheChequeToPrint({chequeURL}: TheChequeToPrintProps) {
  return (<>
    <QRCode value={chequeURL} />
    <a href={chequeURL}>Link</a>
  </>);
}

export default TheChequeToPrint;