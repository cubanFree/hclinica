import { getServerSession } from "next-auth"
import Header from "@/components/header"
import { authOptions } from "@/lib/auth"
import { AuthProvider } from "@/components/session-provider"

export default async function DashboardLayout({ children }) {

    // Obtiene la sesión en el server
    const session = await getServerSession(authOptions)

    return (
        <div className="min-h-screen w-full mx-auto flex flex-col border border-gray-300">
            {/* Header */}
            <div className="bg-[linear-gradient(to_right,_#e5e7eb_20%,_#0f4c75_70%,_#0c3b5c_100%)]">
                <Header />
            </div>

            {/* Main content */}
            <main className="flex-1 w-[850px] mx-auto">
                <AuthProvider session={session}>
                    {children}
                </AuthProvider>
            </main>
        </div>
    )
}
