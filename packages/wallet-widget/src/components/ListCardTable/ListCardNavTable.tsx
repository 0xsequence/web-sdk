import { Card, Divider } from '@0xsequence/design-system'

export const ListCardNavTable = ({
  children,
  navItems,
  style
}: {
  children: React.ReactNode
  navItems: React.ReactNode[]
  style?: React.CSSProperties
}) => {
  return (
    <div className="flex flex-col mt-4 w-full overflow-hidden" style={{ borderRadius: '8px', ...style }}>
      <Card
        className="flex flex-row justify-between items-center rounded-none bg-background-raised "
        style={{ height: '52px', paddingRight: '12px' }}
      >
        {children}
      </Card>
      {navItems.map((navItem, index) => (
        <div key={index}>
          <Divider className="m-0" />
          {navItem}
        </div>
      ))}
    </div>
  )
}
