import type { ETHAuthProof } from '@0xsequence/auth'
import { ETHAuth, Proof } from '@0xsequence/ethauth'
import type { Storage, UsePublicClientReturnType } from 'wagmi'
import type { GetWalletClientData } from 'wagmi/query'

import { DEFAULT_SESSION_EXPIRATION, LocalStorageKey } from '../constants/index.js'
import type { StorageItem } from '../types.js'

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

  const primaryType = Object.keys(typedData.types).find(key => key !== 'EIP712Domain' && typedData.types[key]) || 'Proof'

  const signature = await walletClient.signTypedData({
    account: walletClient.account.address,
    domain: {
      name: typedData.domain.name,
      version: typedData.domain.version,
      chainId: typedData.domain.chainId as bigint,
      verifyingContract: typedData.domain.verifyingContract as any,
      salt: typedData.domain.salt as `0x${string}`
    },
    primaryType,
    types: typedData.types,
    message: typedData.message
  })

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

  const typedData = proof.typedData

  const primaryType = Object.keys(typedData.types).find(key => key !== 'EIP712Domain' && typedData.types[key]) || 'Proof'

  const isValid = await publicClient.verifyTypedData({
    address: walletAddress,
    domain: {
      name: typedData.domain.name || undefined,
      version: typedData.domain.version || undefined,
      chainId: typedData.domain.chainId as bigint,
      verifyingContract: (typedData.domain.verifyingContract as `0x${string}`) || undefined,
      salt: (typedData.domain.salt as `0x${string}`) || undefined
    },
    types: typedData.types as any,
    primaryType,
    message: typedData.message,
    signature: decodedProof.signature as `0x${string}`
  })

  return isValid
}
