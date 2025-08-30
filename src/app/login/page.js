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
        <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8">
            {/* Header del hospital */}
            <h2 className="w-full flex justify-center">
                Logo
            </h2>

            {/* Formulario de login */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-lg sm:px-10">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <Label className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </Label>
                            <div className="mt-1">
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    placeholder="doctor@hospital.com"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </Label>
                            <div className="mt-1">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                disabled={!email || !password || loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                type="submit"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verificando credenciales...
                                    </div>
                                ) : "Acceder al sistema"}
                            </Button>
                        </div>
                    </form>

                    {/* Footer informativo */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Información de seguridad</span>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
                            <p>• Este sistema registra todos los accesos</p>
                            <p>• Solo para personal médico autorizado</p>
                            <p>• Datos protegidos bajo normativa HIPAA</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}