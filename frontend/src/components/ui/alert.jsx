import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils" // <-- FIXED

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&:has(svg)]:pl-11 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// --- FIX 1: Added 'children' ---
const Alert = React.forwardRef(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {children}
  </div>
))
Alert.displayName = "Alert"

// --- FIX 2: This was the main build error. Added 'children' ---
const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h5>
))
AlertTitle.displayName = "AlertTitle"

// --- FIX 3: Added 'children' ---
const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  >
    {children}
  </div>
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

// --- FIX 4: Removed the extra '}' that was here ---