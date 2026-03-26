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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && (
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon name={icon} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 ml-9 sm:ml-14">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">{children}</div>}
    </div>
  )
}
