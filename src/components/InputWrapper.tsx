
import "./InputWrapper.css";

interface InputWrapperProps {
  children: React.ReactNode;
}

function InputWrapper({children}: InputWrapperProps) {
  return (<div className='input-wrapper'>
    {children}
  </div>)
}

export default InputWrapper;