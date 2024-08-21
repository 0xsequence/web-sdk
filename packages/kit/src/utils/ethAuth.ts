import { sequence } from '0xsequence'
import { ETHAuthProof } from '@0xsequence/auth'
import { ETHAuth, Proof } from '@0xsequence/ethauth'
import { UsePublicClientReturnType, Storage } from 'wagmi'
import { GetWalletClientData } from 'wagmi/query'

import { LocalStorageKey, DEFAULT_SESSION_EXPIRATION } from '../constants'
import { StorageItem } from '../types'

import { publicClientToProvider, walletClientToSigner } from './adapters'

export const signEthAuthProof = async (
  walletClient: GetWalletClientData<any, any>,
  storage: Storage<StorageItem>
): Promise<ETHAuthProof> => {
  const proofInformation = await storage.getItem(LocalStorageKey.EthAuthProof)

  // if proof information was generated and saved upon wallet connection, use that
  if (proofInformation) {
    return proofInformation
  }

  // generate a new proof
  const proofSettings = await storage.getItem(LocalStorageKey.EthAuthSettings)

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

  const signer = await walletClientToSigner(walletClient)
  const signature = await signer.signTypedData(typedData.domain, typedData.types, typedData.message)

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
