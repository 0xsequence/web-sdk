import { useContext } from 'react'
import { sequence } from '0xsequence' 
import { ethers } from 'ethers'
import { useOpenConnectModal } from '@0xsequence/kit-core'
import { useOpenWalletModal } from '@0xsequence/kit-wallet'
import { useDisconnect, useAccount, useSigner, useProvider } from 'wagmi'
import { ModalThemeContext } from '../contexts'

import './Homepage.css';

function Homepage() {
  const { setIsDarkMode, isDarkMode } = useContext(ModalThemeContext)
  const { address, connector, isConnected } = useAccount()
  const openConnectModal = useOpenConnectModal()
  const openWalletModal = useOpenWalletModal()
  const { disconnect } = useDisconnect()
  const { data: signer } = useSigner()
  const provider = useProvider()

  const signMessage = async () => {
    if (!signer) {
      return
    }

    try {
      const message = `Two roads diverged in a yellow wood,
        Robert Frost poet
        
        And sorry I could not travel both
        And be one traveler, long I stood
        And looked down one as far as I could
        To where it bent in the undergrowth;
        
        Then took the other, as just as fair,
        And having perhaps the better claim,
        Because it was grassy and wanted wear;
        Though as for that the passing there
        Had worn them really about the same,
        
        And both that morning equally lay
        In leaves no step had trodden black.
        Oh, I kept the first for another day!
        Yet knowing how way leads on to way,
        I doubted if I should ever come back.
        
        I shall be telling this with a sigh
        Somewhere ages and ages hence:
        Two roads diverged in a wood, and I—
        I took the one less traveled by,
        And that has made all the difference.`
  
      // sign
      const sig = await signer.signMessage(message)
      console.log('signature:', sig)
  
      const isValid = await sequence.utils.isValidMessageSignature(await signer.getAddress(), message, sig, provider as ethers.providers.Web3Provider)
      console.log('isValid?', isValid)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button className="Button" onClick={() => { setIsDarkMode && setIsDarkMode(!isDarkMode) }}>Change Modal Theme</button>
        <div>Modal theme: {isDarkMode ? 'dark' : 'light'}</div>
        {isConnected ? (
          <>
            <button className="Button" onClick={() => { disconnect() }}>
              Disconnect
            </button>
            <button className="Button" onClick={() => { openWalletModal && openWalletModal(true) }}>
              Open Wallet UI
            </button>
            <button className="Button" onClick={() => { signMessage() }}>
              Sign Message
            </button>
            <div>Connected wallet: {connector?.name}</div>
            <div>Connected address: {address}</div>
          </>
        ) : (
          <button className="Button" onClick={() => { openConnectModal && openConnectModal(true) }}>
            Connect
          </button>
        )}

      </header>
    </div>
  );
}

export default Homepage;
