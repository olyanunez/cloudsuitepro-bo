"use client"

import { Icon } from './Icons'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name={icon} className="h-6 w-6 text-primary" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-14">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
