

function MainContainer({children}: {children: React.ReactNode}) {
  return (
    <>
    <div className="container">
      <header className="header">
        <div className="logo">
          <h1>The simplest NFT generator</h1>
          <h2>Just generate one for yourself!</h2>
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
