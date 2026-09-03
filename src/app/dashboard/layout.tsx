export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div data-clarity-mask="true">{children}</div>;
}
