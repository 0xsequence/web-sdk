import { TabsHeader, TextInput, TabsContent, TabsRoot, SearchIcon } from '@0xsequence/design-system'
import { useState } from 'react'

export const SendGeneral = () => {
  const [selectedTab, setSelectedTab] = useState<'coins' | 'collectibles'>('coins')

  return (
    <div className="px-4 pb-5">
      <TabsRoot
        className="flex flex-col justify-center items-center gap-4"
        value={selectedTab}
        onValueChange={value => setSelectedTab(value as 'coins' | 'collectibles')}
      >
        <TabsHeader
          tabs={[
            { label: 'Coins', value: 'coins' },
            { label: 'Collectibles', value: 'collectibles' }
          ]}
          value={selectedTab}
        />
        <div className="w-full">
          <TextInput name="send-to" leftIcon={SearchIcon} placeholder="Search or paste token address" />
        </div>
        <TabsContent value={'coins'}></TabsContent>
        <TabsContent className="flex flex-col w-full gap-4" value={'collectibles'}></TabsContent>
      </TabsRoot>
    </div>
  )
}
