import { Button, CoinsIcon, GameIcon, GameSwordIcon, Text } from '@0xsequence/design-system'

export const NoResults = ({ enableClearFilters }: { enableClearFilters?: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="flex flex-row gap-2">
        <CoinsIcon color="white" />
        <GameIcon color="white" />
        <GameSwordIcon color="white" />
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <Text variant="medium" color="primary">
          No results found
        </Text>

        <Text className="text-center" variant="normal" color="muted">
          Search your wallet for tokens,
          <br />
          collectibles or collections
        </Text>

        {enableClearFilters && (
          <Button variant="glass" onClick={() => {}}>
            Clear results{' '}
          </Button>
        )}
      </div>
    </div>
  )
}
