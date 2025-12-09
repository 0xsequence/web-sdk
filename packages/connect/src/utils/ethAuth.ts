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
  const ethAuth = new ETHAuth()
  const walletAddress = walletClient.account.address
  const normalizedWalletAddress = walletAddress.toLowerCase()

  const [proofInformation, proofSettings] = await Promise.all([
    storage.getItem(LocalStorageKey.EthAuthProof),
    storage.getItem(LocalStorageKey.EthAuthSettings)
  ])
  const clearCachedProof = () => storage.removeItem(LocalStorageKey.EthAuthProof)

  if (!proofSettings) {
    if (proofInformation) {
      await clearCachedProof()
    }
    throw new Error('No ETHAuth settings found')
  }

  const expectedApp = proofSettings.app || 'app'
  const expectedOrigin = proofSettings.origin
  const expectedNonce = proofSettings.nonce
  const expectedExpiry = proofSettings.expiry ? Math.max(proofSettings.expiry, 200) : DEFAULT_SESSION_EXPIRATION

  // if proof information was generated and saved upon wallet connection, use that
  if (proofInformation) {
    try {
      const decodedProof = await ethAuth.decodeProof(proofInformation.proofString, true)
      const cachedExpiry =
        decodedProof.claims.exp && decodedProof.claims.iat ? decodedProof.claims.exp - decodedProof.claims.iat : null

      const isMatchingProof =
        decodedProof.address === normalizedWalletAddress &&
        (decodedProof.claims.app || 'app') === expectedApp &&
        (decodedProof.claims.ogn ?? undefined) === (expectedOrigin ?? undefined) &&
        (decodedProof.claims.n ?? undefined) === (expectedNonce ?? undefined) &&
        cachedExpiry !== null &&
        Math.abs(cachedExpiry - expectedExpiry) <= 1

      if (isMatchingProof) {
        return proofInformation
      }

      await clearCachedProof()
    } catch {
      await clearCachedProof()
    }
  }

  const proof = new Proof()
  proof.address = walletAddress
  proof.setIssuedAtNow()

  proof.claims.app = expectedApp
  proof.claims.ogn = expectedOrigin
  proof.claims.n = expectedNonce

  proof.setExpiryIn(expectedExpiry)

  const typedData = proof.messageTypedData()

  const primaryType = Object.keys(typedData.types).find(key => key !== 'EIP712Domain' && typedData.types[key]) || 'Proof'

  const signature = await walletClient.signTypedData({
    account: walletClient.account.address,
    domain: {
      name: typedData.domain.name,
      version: typedData.domain.version,
      chainId: typedData.domain.chainId == null ? undefined : BigInt(typedData.domain.chainId as any),
      verifyingContract: (typedData.domain.verifyingContract as `0x${string}`) || undefined,
      salt: (typedData.domain.salt as `0x${string}`) || undefined
    },
    primaryType,
    types: typedData.types,
    message: typedData.message
  })

  proof.signature = signature

  const proofString = await ethAuth.encodeProof(proof, true)
  const proofPayload = { typedData, proofString }

  await storage.setItem(LocalStorageKey.EthAuthProof, proofPayload)

  return proofPayload
}

export const validateEthProof = async (
  walletClient: GetWalletClientData<any, any>,
  publicClient: UsePublicClientReturnType<any, any>,
  proof: ETHAuthProof
): Promise<boolean> => {
  const walletAddress = walletClient.account.address.toLowerCase()
  const ethAuth = new ETHAuth()

  const decodedProof = await ethAuth.decodeProof(proof.proofString, true)

  if (decodedProof.address !== walletAddress) {
    return false
  }

  const typedData = decodedProof.messageTypedData()

  const primaryType = Object.keys(typedData.types).find(key => key !== 'EIP712Domain' && typedData.types[key]) || 'Proof'

  const isValid = await publicClient.verifyTypedData({
    address: walletClient.account.address,
    domain: {
      name: typedData.domain.name || undefined,
      version: typedData.domain.version || undefined,
      chainId: typedData.domain.chainId == null ? undefined : BigInt(typedData.domain.chainId as any),
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
