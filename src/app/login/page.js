"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.ok) router.replace("/dashboard");
        else toast.error("👎Credenciales inválidas");
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[350px] mx-auto">
            {/* Header del hospital */}
            <div className="mb-0">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-32 w-auto drop-shadow-lg"
                />
            </div>

            {/* Formulario de login */}
            <Card className="w-full backdrop-blur-lg bg-gray-100 border border-blue-300 shadow-2xl rounded-xl border-b-0 px-6">
                <div className="p-4">
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-8 px-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/95"
                                placeholder="doctor@hospital.com"
                            />
                        </div>

                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-8 px-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/95"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            disabled={!email || !password || loading}
                            className="w-full h-8 cursor-pointer flex justify-center items-center rounded-lg text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            type="submit"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verificando...
                                </div>
                            ) : "Acceder al sistema"}
                        </Button>
                    </form>

                    {/* Footer informativo compacto */}
                    <div className="mt-5 border-t border-gray-200">
                        <div className="text-center">
                            <span className="text-xs text-gray-500 font-medium">Información de seguridad</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-600 space-y-1">
                            <div className="flex items-center justify-center">
                                <div className="w-1 h-1 bg-sky-500 rounded-full mr-2"></div>
                                <span>Sistema registra todos los accesos</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-1 h-1 bg-sky-500 rounded-full mr-2"></div>
                                <span>Solo personal médico autorizado</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-1 h-1 bg-sky-500 rounded-full mr-2"></div>
                                <span>Protegido bajo normativa HIPAA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}