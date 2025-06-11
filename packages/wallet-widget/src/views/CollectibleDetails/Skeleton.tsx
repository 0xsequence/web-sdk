import { ArrowUpIcon, Button, Divider, ExternalLinkIcon, Skeleton } from '@0xsequence/design-system'

interface CollectibleDetailsSkeletonProps {
  isReadOnly: boolean
}

export const CollectibleDetailsSkeleton = ({ isReadOnly }: CollectibleDetailsSkeletonProps) => {
  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        <Skeleton className="w-full aspect-square rounded-lg" />

        <div className="flex flex-row gap-4">
          <Button className="text-primary w-full" variant="glass" leftIcon={ArrowUpIcon} label="Send" disabled={isReadOnly} />
          <Button className="text-primary w-full" variant="glass" leftIcon={ExternalLinkIcon} label="Open in..." />
        </div>

        <Skeleton className="w-full h-10" />

        <Skeleton className="w-full h-7" />

        <Divider className="my-0" />

        <Skeleton className="w-full h-7" />

        <Divider className="my-0" />

        <Skeleton className="w-full h-7" />

        <Divider className="my-0" />

        <Skeleton className="w-full h-7" />

        <Divider className="my-0" />

        <Skeleton className="w-full h-14" />
      </div>
    </div>
  )
}
