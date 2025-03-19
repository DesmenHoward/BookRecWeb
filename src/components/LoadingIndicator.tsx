interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-text-light text-center">{message}</p>
      <p className="text-sm text-text-light/70 mt-2 text-center">Powered by readers</p>
    </div>
  );
}