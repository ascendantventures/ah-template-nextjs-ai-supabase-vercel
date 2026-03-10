export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#09090B', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
