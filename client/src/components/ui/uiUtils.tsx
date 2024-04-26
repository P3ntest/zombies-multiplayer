export function CenteredFullScreen({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center pointer-events-auto"
      onClick={() => {
        onClose?.();
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
}
