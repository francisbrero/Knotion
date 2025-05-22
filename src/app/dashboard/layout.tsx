import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            KNotion
          </Link>
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name ?? "User"} 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700">
              {session?.user?.name}
            </span>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex">
        <nav className="w-64 pr-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Navigation</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-gray-800"
                >
                  All Links
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/collections" 
                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-gray-800"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/tags" 
                  className="block py-2 px-3 rounded-md hover:bg-gray-100 text-gray-800"
                >
                  Tags
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 