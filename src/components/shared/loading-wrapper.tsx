import { Spinner } from "@/components/ui/spinner";

interface ErrorAlertProps {
  message: string;
}

function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

interface LoadingWrapperProps {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingWrapper({
  loading, error, empty, emptyState, children
}: LoadingWrapperProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (error) return <ErrorAlert message={error} />;
  if (empty && emptyState) return <>{emptyState}</>;
  return <>{children}</>;
}