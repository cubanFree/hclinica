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
    const [searching, setSearching] = useState(false)

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

        // Calcular diferentes unidades de tiempo
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const diffWeeks = Math.floor(diffDays / 7)
        const diffMonths = Math.floor(diffDays / 30)

        // Lógica de tiempo exacto
        if (diffMinutes < 1) return "Hace un momento"
        if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
        if (diffDays === 1) return "Hace 1 día"
        if (diffDays < 7) return `Hace ${diffDays} días`
        if (diffWeeks === 1) return "Hace 1 semana"
        if (diffDays < 30) return `Hace ${diffWeeks} semana${diffWeeks !== 1 ? 's' : ''}`
        if (diffMonths === 1) return "Hace 1 mes"
        return `Hace ${diffMonths} meses`
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
            setSearching(false)
            return
        }

        setSearching(true)

        const searchTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/dashboard/search?query=${search}`)
                const data = await res.json()
                setPatients(data)
            } catch (error) {
                console.error('Error searching patients:', error)
            } finally {
                setSearching(false)
            }
        }, 300) // Debounce de 300ms

        return () => clearTimeout(searchTimeout)
    }, [search])

    return (
        <div className="min-h-screen flex flex-col">
            <h1 className="text-4xl font-extralight text-sky-800 p-6">
                Hola, {doctorName || "Doctor"}
            </h1>

            <main className="flex-1 p-6">
                {/* Barra de búsqueda */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    {/* Barra de búsqueda */}
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
                            className="w-full border-2 border-slate-400 rounded-md pl-10 pr-3 py-2 text-gray-800 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-slate-500"
                        />
                    </div>

                    {/* Botón Nuevo Paciente */}
                    <div>
                        <Link
                            href="dashboard/patients/new"
                            className="bg-slate-600 hover:bg-slate-700 border-slate-700 hover:border-slate-800 text-gray-100 px-4 py-2 rounded-md border-2 transition-all duration-200 font-medium shadow-sm inline-block"
                        >
                            + Nuevo Paciente
                        </Link>
                    </div>
                </div>

                {/* Resultados */}
                <div className="w-full">
                    {search ? (
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {/* Header de la tabla */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <div className="grid grid-cols-12 gap-4 px-6 py-3">
                                    <div className="col-span-4 font-semibold text-slate-700 text-sm">Nombre</div>
                                    <div className="col-span-2 font-semibold text-slate-700 text-sm">Cédula</div>
                                    <div className="col-span-2 font-semibold text-slate-700 text-sm">Edad</div>
                                    <div className="col-span-2 font-semibold text-slate-700 text-sm">Sexo</div>
                                    <div className="col-span-2 font-semibold text-slate-700 text-sm">Última consulta</div>
                                </div>
                            </div>

                            {/* Contenido de la tabla */}
                            <div>
                                {searching ? (
                                    // Estado de carga
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm font-medium">Buscando...</span>
                                        </div>
                                    </div>
                                ) : patients.length > 0 ? (
                                    // Resultados encontrados
                                    <div className="divide-y divide-slate-100">
                                        {patients.map((p) => (
                                            <div
                                                key={p.id}
                                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-200 cursor-pointer transition-colors duration-150 group"
                                                onClick={() => (window.location.href = `/dashboard/patients/${p.id}`)}
                                            >
                                                <div className="col-span-4 text-slate-900 font-medium group-hover:text-slate-700 group-hover:underline">
                                                    {p.firstName} {p.lastName}
                                                </div>
                                                <div className="col-span-2 text-slate-600 font-mono text-sm">
                                                    {p.cedula}
                                                </div>
                                                <div className="col-span-2 text-slate-600">
                                                    {p.age}
                                                </div>
                                                <div className="col-span-2 text-slate-600">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.sex === 'M'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-pink-100 text-pink-800'
                                                        }`}>
                                                        {p.sex === 'M' ? 'Masculino' : 'Femenino'}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-slate-600 text-sm">
                                                    {p.consultations?.[0]
                                                        ? new Date(p.consultations[0].updatedAt).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })
                                                        : (
                                                            <span className="text-slate-400 italic">Sin consultas</span>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Sin resultados
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <svg className="h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-slate-500 text-sm font-medium">No se encontraron pacientes</p>
                                        <p className="text-slate-400 text-xs mt-1">Intenta con otro término de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Cards cuando no hay búsqueda (mantener igual)
                        !loading && (
                            lastRecords.length === 0 ? (
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
                            )
                        )
                    )}
                </div>
            </main>
        </div>
    )
}