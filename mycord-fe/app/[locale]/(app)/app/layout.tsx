import { LeftSidebar } from "@/components/left-sidebar/left-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import withAuth from "@/hocs/withAuth";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider open={false}>
      <LeftSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

export default withAuth(AppLayout);
