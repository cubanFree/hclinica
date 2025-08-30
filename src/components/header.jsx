'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { signOut } from "next-auth/react"
import { useState } from "react"

export default function Header() {

    const [loading, setLoading] = useState(false);

    const handleLogout = async (e) => {
        e.preventDefault();
        setLoading(true);
        await signOut();
        window.location.href = "/login";
        setLoading(false);
    }

    return (
        <header className="p-4 w-[850px] mx-auto flex justify-between items-center text-white rounded-b-sm">
            <h1 className="text-2xl font-bold">Logo</h1>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <span className="text-white hover:text-blue-200 cursor-pointer">Cerrar sesión</span>
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