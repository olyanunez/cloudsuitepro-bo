// Este componente está inspirado en Shadcn UI Sheet
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

// Create a context to manage the sheet state
type SheetContextType = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextType>({});

const useSheetContext = () => React.useContext(SheetContext);

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:bg-gray-800",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => {
    // Create a context value to pass down to children
    const sheetContextValue = React.useMemo(
      () => ({ open, onOpenChange }),
      [open, onOpenChange]
    );

    return (
      <SheetContext.Provider value={sheetContextValue}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </SheetContext.Provider>
    );
  }
)
Sheet.displayName = "Sheet"

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { onOpenChange } = useSheetContext();
  
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange?.(true);
    },
    [onClick, onOpenChange]
  );

  return (
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
})
SheetTrigger.displayName = "SheetTrigger"

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  SheetCloseProps
>(({ className, onClick, asChild, children, ...props }, ref) => {
  const { onOpenChange } = useSheetContext();
  
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange?.(false);
    },
    [onClick, onOpenChange]
  );

  // If asChild is true, clone the children and pass the onClick handler
  if (asChild && React.isValidElement(children)) {
    // Create a new onClick handler that combines the child's onClick with our close handler
    const childProps = children.props as { onClick?: (e: React.MouseEvent) => void };
    
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        // Call the child's onClick if it exists
        childProps.onClick?.(e);
        // Call our handler to close the sheet
        handleClick(e as React.MouseEvent<HTMLButtonElement>);
      }
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      ref={ref}
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 dark:ring-offset-gray-950 dark:focus:ring-gray-800 dark:data-[state=open]:bg-gray-800 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {!asChild ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="sr-only">Close</span>
        </>
      ) : null}
    </button>
  );
})
SheetClose.displayName = "SheetClose"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSheetContext();
    
    // Handle backdrop click to close the sheet
    const handleBackdropClick = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onOpenChange?.(false);
        }
      },
      [onOpenChange]
    );

    // If not open, don't render anything
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/50" onClick={handleBackdropClick}>
        <div
          ref={ref}
          className={`${sheetVariants({ side })} ${className}`}
          {...props}
        >
          {/* <SheetClose className="absolute right-4 top-4" /> */}
          {children}
        </div>
      </div>
    );
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-gray-900 dark:text-gray-50 ${className}`}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
