import React, { RefObject, PropsWithChildren, useEffect, useRef, useState, useMemo } from 'react'

export const useIntersectionObserver = (ref: RefObject<Element | null>, options?: IntersectionObserverInit) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const observer = useMemo(() => new IntersectionObserver(([entry]) => setEntry(entry), options), [])

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.disconnect()
      }
    }
  }, [ref.current, observer])

  return entry?.isIntersecting ?? false
}

interface InfiniteScrollProps {
  onLoad: (pageNumber: number) => Promise<any>
  hasMore?: boolean
  resetTrigger?: boolean
}

export const InfiniteScroll = (props: PropsWithChildren<InfiniteScrollProps>) => {
  const { onLoad, hasMore = true, children, resetTrigger } = props

  const [pageNumber, setPageNumber] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isBottom = useIntersectionObserver(bottomRef)

  useEffect(() => {
    setPageNumber(0)
  }, [resetTrigger])

  useEffect(() => {
    if (isBottom && hasMore && !isLoading) {
      handleLoad()
    }
  }, [isBottom])

  const handleLoad = async () => {
    setLoading(true)

    await onLoad(pageNumber)

    setPageNumber(pageNumber => pageNumber + 1)
    setLoading(false)
  }

  return (
    <>
      {children}
      <div ref={bottomRef} />
    </>
  )
}
