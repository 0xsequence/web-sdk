import { Spinner } from '@0xsequence/design-system'
import React from 'react'

export const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-6 mt-4">
      <div>
        <Spinner size="lg" />
      </div>
    </div>
  )
}
