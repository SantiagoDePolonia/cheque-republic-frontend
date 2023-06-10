

function MainContainer({children}: {children: React.ReactNode}) {
  return (
    <>
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>Cheque Republic</h1>
          <h2>Cheques on EVM compatible chains!</h2>
        </div>
      </header>
      <main className='main'>
        {children}
      </main>
    </div>
    <div className='parrot animated-animal'></div>
    <div className='camel animated-animal'></div>
    <div className='eagle animated-animal'></div>
    </>
  );
}

export default MainContainer;
