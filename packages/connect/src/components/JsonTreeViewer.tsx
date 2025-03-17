import { useState } from 'react'

interface TreeNodeProps {
  data: any
  keyName?: string
  depth?: number
}

const TreeNode = ({ data, keyName, depth = 0 }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const isObject = typeof data === 'object' && data !== null
  const isArray = Array.isArray(data)

  const toggle = () => setIsExpanded(!isExpanded)

  return (
    <div className="select-none" style={{ marginLeft: depth > 0 ? `${depth * 1}rem` : '0' }}>
      {/* Key and Value */}
      <div
        onClick={isObject ? toggle : undefined}
        className={`flex items-center gap-1 px-1 py-1 ${isObject ? 'cursor-pointer' : ''}`}
      >
        {isObject && <span className="w-4 h-4 flex items-center justify-center">{isExpanded ? '▼' : '▶'}</span>}

        {keyName && <span className="font-medium">{keyName}:</span>}

        {isArray && <span>[{!isExpanded && '...'}]</span>}

        {!isObject && <span>{typeof data === 'string' ? `"${data}"` : data === null ? 'null' : data.toString()}</span>}

        {isObject && !isArray && (
          <span>
            {'{'}
            {!isExpanded && '...'}
            {'}'}
          </span>
        )}
      </div>

      {/* Children */}
      {isExpanded && isObject && (
        <div className="ml-2">
          {Object.entries(data).map(([key, value]) => (
            <TreeNode key={key} keyName={isArray ? undefined : key} data={value} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface JsonTreeViewerProps {
  data: object
  className?: string
}

export const JsonTreeViewer = ({ data }: JsonTreeViewerProps) => {
  return (
    <div className={'font-mono text-sm overflow-x-auto'}>
      <TreeNode data={data} />
    </div>
  )
}
