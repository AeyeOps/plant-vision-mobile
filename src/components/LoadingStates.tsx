import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { AlertTriangle, FileSearch, Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export function InspectionCardSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-[250px] mb-2" />
      <Skeleton className="h-4 w-[200px] mb-2" />
      <Skeleton className="h-4 w-[150px]" />
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-[100px] mb-2" />
          <Skeleton className="h-8 w-[60px]" />
        </Card>
      ))}
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function Navigation3DSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
}

export const EmptyState = ({
  icon: Icon = FileSearch,
  title = 'No Data Found',
  description = 'There are no items to display at the moment.'
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="bg-muted/20 rounded-full p-6 mb-4">
      <Icon className="h-12 w-12 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-xs">{description}</p>
  </div>
)

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = 'Something Went Wrong',
  description = 'An unexpected error occurred while loading data.',
  onRetry
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="bg-destructive/20 rounded-full p-6 mb-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
    </div>
    <h2 className="text-xl font-semibold text-destructive mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-xs mb-4">{description}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
)

export function InspectionFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  )
}