"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Stethoscope } from "lucide-react"
import { CalendarDays } from "lucide-react"

export default function DashboardPage() {
    const [search, setSearch] = useState("")
    const [patients, setPatients] = useState([])
    const [lastRecords, setLastRecords] = useState([])
    const [loading, setLoading] = useState(true)

    const { data: session } = useSession()

    const doctorId = session?.user?.id
    const doctorName = session?.user?.name

    // Función para obtener los últimos 4 dígitos de la cédula
    const formatCedula = (cedula) => {
        if (!cedula) return "••••"
        const str = cedula.toString()
        return str.length > 4 ? `••••${str.slice(-4)}` : cedula
    }

    // Función para truncar texto largo
    const truncateText = (text, maxLength = 50) => {
        if (!text) return "Sin diagnóstico registrado"
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }

    // Función para calcular días transcurridos
    const getDaysAgo = (date) => {
        const now = new Date()
        const consultationDate = new Date(date)
        const diffTime = Math.abs(now - consultationDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return "Hace 1 día"
        if (diffDays < 7) return `Hace ${diffDays} días`
        if (diffDays < 14) return "Hace 1 semana"
        if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
        return `Hace ${Math.ceil(diffDays / 30)} meses`
    }

    // Fetch últimas 3 consultas
    useEffect(() => {
        async function fetchLastRecords() {
            if (!doctorId) return
            const res = await fetch(`/api/dashboard/recents?doctorId=${doctorId}`)
            const data = await res.json()
            setLastRecords(data)
            setLoading(false)
        }

        fetchLastRecords()
    }, [doctorId])

    // Buscar pacientes
    useEffect(() => {
        if (!search) {
            setPatients([])
            return
        }

        async function fetchPatients() {
            const res = await fetch(`/api/dashboard/search?query=${search}`)
            const data = await res.json()
            setPatients(data)
        }

        fetchPatients()
    }, [search])

    return (
        <div className="min-h-screen flex flex-col">
            <h1 className="text-4xl mb-4 font-light text-sky-800">
                Hola, {doctorName || "Doctor"}
            </h1>
            <main className="flex-1 p-6">
                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-800">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                                />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar paciente por nombre o cédula..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border-2 border-sky-800 focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-3 py-2 text-gray-800 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Opciones */}
                <div className="mb-6 text-center">
                    <Link
                        href="dashboard/patients/new"
                        className="bg-sky-700 hover:bg-sky-800 border-sky-800 hover:border-sky-800 text-white px-2 py-1 rounded  border-2"
                    >
                        + Nueva Historia Clínica
                    </Link>
                </div>

                {/* Resultados */}
                <div className="w-full">
                    {search ? (
                        // Si hay búsqueda
                        patients.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-300 text-left">
                                            <th className="px-3 py-1 text-gray-800">Nombre</th>
                                            <th className="px-3 py-1 text-gray-800">Cédula</th>
                                            <th className="px-3 py-1 text-gray-800">Edad</th>
                                            <th className="px-3 py-1 text-gray-800">Sexo</th>
                                            <th className="px-3 py-1 text-gray-800">Última consulta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((p) => (
                                            <tr
                                                key={p.id}
                                                className="cursor-pointer hover:bg-neutral-400"
                                                onClick={() => (window.location.href = `/dashboard/patients/${p.id}`)}
                                            >
                                                <td className="px-4 py-2 border-b border-gray-400">
                                                    {p.firstName} {p.lastName}
                                                </td>
                                                <td className="px-4 py-2 border-b border-gray-400">{p.cedula}</td>
                                                <td className="px-4 py-2 border-b border-gray-400">{p.age}</td>
                                                <td className="px-4 py-2 border-b border-gray-400">{p.sex}</td>
                                                <td className="px-4 py-2 border-b border-gray-400">
                                                    {p.consultations?.[0]
                                                        ? new Date(p.consultations[0].updatedAt).toLocaleDateString()
                                                        : "Sin consultas"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // Mensaje si no hay resultados
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-300 text-left">
                                            <th className="px-3 py-1 text-gray-800">Nombre</th>
                                            <th className="px-3 py-1 text-gray-800">Cédula</th>
                                            <th className="px-3 py-1 text-gray-800">Edad</th>
                                            <th className="px-3 py-1 text-gray-800">Sexo</th>
                                            <th className="px-3 py-1 text-gray-800">Última consulta</th>
                                        </tr>
                                    </thead>
                                </table>
                                <p className="text-center py-4 text-gray-500">No hay resultados</p>
                            </div>
                        )
                    ) : (
                        // Si NO hay búsqueda - Cards mejoradas
                        !loading &&
                        (lastRecords.length === 0 ? (
                            <p className="col-span-full text-center">No hay consultas recientes.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {lastRecords.map((rec) => (
                                    <Card
                                        key={rec.id}
                                        onClick={() => window.location.href = `/dashboard/patients/${rec.patient.id}`}
                                        className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-200 shadow-lg rounded-2xl hover:shadow-xl transition cursor-pointer group"
                                    >
                                        <CardHeader className="flex flex-row items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <Stethoscope className="h-6 w-6 text-blue-700" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-800 group-hover:underline">
                                                    {rec.patient.firstName} {rec.patient.lastName}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatCedula(rec.patient.cedula)}
                                                </p>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="text-gray-700 space-y-3">
                                            {/* Diagnóstico */}
                                            <div>
                                                <span className="font-semibold text-teal-700">Diagnóstico: </span>
                                                <p className="text-sm mt-1">{truncateText(rec.diagnosis)}</p>
                                            </div>

                                            {/* Información de tiempo y consultas */}
                                            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <CalendarDays className="h-4 w-4 text-blue-500" />
                                                    {getDaysAgo(rec.updatedAt)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(rec.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Contador de consultas si está disponible */}
                                            {rec.patient.consultationCount && (
                                                <div className="text-xs text-center text-gray-500 bg-gray-50 rounded px-2 py-1">
                                                    {rec.patient.consultationCount} consulta{rec.patient.consultationCount !== 1 ? 's' : ''} total{rec.patient.consultationCount !== 1 ? 'es' : ''}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}