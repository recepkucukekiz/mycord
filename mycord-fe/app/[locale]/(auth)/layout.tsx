export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row h-screen container mx-auto items-center justify-center px-4">
      <div className="md:w-1/2 h-full p-8 hidden md:flex items-center justify-center">LOGO</div>
      <div className="md:w-1/2 h-full p-8 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
