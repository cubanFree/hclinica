'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Header() {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        await signOut();
        router.push("/login");
        setLoading(false);
    }

    return (
        <header className="w-[850px] mx-auto flex justify-between items-center text-white px-6">
            <img src="/logo.png" alt="Logo" className="h-26 w-auto" />

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="hover:text-red-300 border-2 border-gray-400 px-4 py-1 rounded-xl font-medium text-sm transition-colors flex items-center space-x-2 cursor-pointer">
                        <span>Cerrar sesión</span>
                        <LogOut className="w-4 h-4" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Seguro que quieres cerrar sesión?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel className={"cursor-pointer"}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction disabled={loading} className={"bg-sky-700 hover:bg-sky-800 border-sky-800 hover:border-sky-800 cursor-pointer"} onClick={(e) => handleLogout(e)}>
                            {loading ? "Espera..." : "Sí, salir"}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    );
}