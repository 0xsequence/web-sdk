import { useProjectAccessKey } from '@0xsequence/kit'
import { MarketplaceIndexer } from '@0xsequence/marketplace'
import { networks, stringTemplate } from '@0xsequence/network';
import { useMemo } from 'react'


export interface UseMarketplaceClientArgs {
  chain: ChainNameOrId,
	isDev?: boolean,
}

export const useMarketplaceClient = ({ chain, isDev = false }: UseMarketplaceClientArgs) => {
  const projectAccessKey = useProjectAccessKey()

  const marketplaceClient = useMemo(() => {
    const env = isDev ? 'development' : 'production'
    const clientUrl = marketplaceApiURL(chain, env)
    return new MarketplaceIndexer(clientUrl, projectAccessKey)
  }, [projectAccessKey])

  return marketplaceClient
}

type ChainNameOrId = string | number;

const getNetwork = (nameOrId: ChainNameOrId) => {
	for (const network of Object.values(networks)) {
		if (
			network.name === String(nameOrId).toLowerCase() ||
			network.chainId === Number(nameOrId)
		) {
			return network;
		}
	}
	throw new Error(`Unsopported chain; ${nameOrId}`);
};

export type Env = 'development' | 'production';

const getPrefix = (env: Env) => {
	switch (env) {
		case 'development':
			return 'dev-';
		case 'production':
			return '';
	}
};

const marketplaceApiURL = (chain: ChainNameOrId, env: Env = 'production') => {
	const prefix = getPrefix(env);
	const network = getNetwork(chain).name;
  const apiBaseUrl = 'https://${prefix}marketplace-api.sequence.app/${network}'
	return stringTemplate(apiBaseUrl, { network: network, prefix });
};