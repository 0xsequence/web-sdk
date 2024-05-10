import { sequence } from '0xsequence'
import { ETHAuthProof } from '@0xsequence/auth'
import { ETHAuth, Proof } from '@0xsequence/ethauth'
import { UsePublicClientReturnType } from 'wagmi'
import { GetWalletClientData } from 'wagmi/query'

import { EthAuthSettings } from '../components/KitProvider'
import { LocalStorageKey, DEFAULT_SESSION_EXPIRATION } from '../constants'

import { publicClientToProvider, walletClientToSigner } from './adapters'
import { getStorageItem } from './storage'

export const signEthAuthProof = async (walletClient: GetWalletClientData<any, any>): Promise<ETHAuthProof> => {
  const proofInformation = getStorageItem(LocalStorageKey.EthAuthProof) as ETHAuthProof | undefined

  // if proof information was generated and saved upon wallet connection, use that
  if (proofInformation) {
    return proofInformation
  }

  // generate a new proof
  const proofSettings = getStorageItem(LocalStorageKey.EthAuthSettings) as EthAuthSettings | undefined

  if (!proofSettings) {
    throw new Error('No ETHAuth settings found')
  }

  const walletAddress = walletClient.account.address

  const proof = new Proof()
  proof.address = walletAddress

  proof.claims.app = proofSettings.app || 'app'
  proof.claims.ogn = proofSettings.origin
  proof.claims.n = proofSettings.nonce

  proof.setExpiryIn(proofSettings.expiry ? Math.max(proofSettings.expiry, 200) : DEFAULT_SESSION_EXPIRATION)

  const typedData = proof.messageTypedData()

  typedData.domain.verifyingContract

  const signer = walletClientToSigner(walletClient)
  const signature = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)

  proof.signature = signature

  const ethAuth = new ETHAuth()
  const proofString = await ethAuth.encodeProof(proof, true)

  return {
    typedData,
    proofString
  }
}

export const validateEthProof = async (
  walletClient: GetWalletClientData<any, any>,
  publicClient: UsePublicClientReturnType<any, any>,
  proof: ETHAuthProof
): Promise<boolean> => {
  const walletAddress = walletClient.account.address
  const ethAuth = new ETHAuth()

  const decodedProof = await ethAuth.decodeProof(proof.proofString, true)
  const provider = publicClientToProvider(publicClient)

  const isValid = await sequence.utils.isValidTypedDataSignature(walletAddress, proof.typedData, decodedProof.signature, provider)

  return isValid
}
