"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PatientHistorial({ params }) {
    const router = useRouter()
    const { id } = use(params)
    console.log(id)

    // Estados principales
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState(null)
    const [patient, setPatient] = useState(null)
    const [consultations, setConsultations] = useState([])
    const [pagination, setPagination] = useState({})
    const [expandedConsultation, setExpandedConsultation] = useState(null)

    // Estados de filtros
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        page: 1
    })

    // Estado para el AlertDialog
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        consultationId: null
    })

    // Fetch consultas
    const fetchConsultations = async (newFilters = null) => {
        try {
            setLoading(true)
            const currentFilters = newFilters || filters

            const params = new URLSearchParams({
                page: currentFilters.page.toString(),
                limit: '5'
            })

            if (currentFilters.startDate) params.append('startDate', currentFilters.startDate)
            if (currentFilters.endDate) params.append('endDate', currentFilters.endDate)

            const res = await fetch(`/api/dashboard/patients/${id}/historial?${params}`)

            if (!res.ok) {
                if (res.status === 404) {
                    setError("Paciente no encontrado")
                    return
                }
                throw new Error(`Error ${res.status}: ${res.statusText}`)
            }

            const data = await res.json()
            setPatient(data.patient)
            setConsultations(data.consultations)
            setPagination(data.pagination)
            setError(null)

        } catch (err) {
            console.error(err)
            setError(err.message || "Error al cargar el historial")
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }

    // Cargar inicial
    useEffect(() => {
        if (id) {
            fetchConsultations()
        }
    }, [id])

    // Abrir dialog de confirmación
    const openDeleteDialog = (consultationId) => {
        setDeleteDialog({
            isOpen: true,
            consultationId
        })
    }

    // Cerrar dialog
    const closeDeleteDialog = () => {
        setDeleteDialog({
            isOpen: false,
            consultationId: null
        })
    }

    // Confirmar eliminación
    const confirmDelete = async () => {
        const consultationId = deleteDialog.consultationId

        try {
            const res = await fetch(`/api/dashboard/patients/${id}/historial?consultationId=${consultationId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error("Error al eliminar consulta")

            toast.success("👌 Consulta eliminada correctamente")

            // Recargar consultas
            window.location.reload()

            // Cerrar acordeón si estaba abierto
            if (expandedConsultation === consultationId) {
                setExpandedConsultation(null)
            }

        } catch (err) {
            console.error(err)
            toast.error("👎 Error al eliminar la consulta")
        } finally {
            closeDeleteDialog()
        }
    }

    // Manejar cambios de filtro
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    // Aplicar filtros
    const applyFilters = () => {
        const newFilters = { ...filters, page: 1 }
        setFilters(newFilters)
        fetchConsultations(newFilters)
    }

    // Limpiar filtros
    const clearFilters = () => {
        const newFilters = { startDate: "", endDate: "", page: 1 }
        setFilters(newFilters)
        fetchConsultations(newFilters)
    }

    // Cambiar página
    const changePage = (newPage) => {
        const newFilters = { ...filters, page: newPage }
        setFilters(newFilters)
        fetchConsultations(newFilters)
    }

    // Toggle acordeón
    const toggleAccordion = (consultationId) => {
        setExpandedConsultation(prev =>
            prev === consultationId ? null : consultationId
        )
    }

    // Componente AlertDialog
    const AlertDialog = () => {
        if (!deleteDialog.isOpen) return null

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.863-.833-2.633 0L4.182 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Confirmar eliminación
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Esta acción no se puede deshacer
                                </p>
                            </div>
                        </div>

                        <p className="text-slate-700 mb-6">
                            ¿Estás seguro de que quieres eliminar esta consulta? Se perderán todos los datos médicos asociados.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteDialog}
                                className="px-4 py-1 cursor-pointer text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-1 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Componente de Paginación
    const Pagination = () => {
        if (!pagination.totalPages || pagination.totalPages <= 1) return null

        const pages = []
        const current = pagination.currentPage
        const total = pagination.totalPages

        // Lógica para mostrar páginas (máximo 7 páginas visibles)
        let start = Math.max(1, current - 3)
        let end = Math.min(total, start + 6)

        if (end - start < 6) {
            start = Math.max(1, end - 6)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        return (
            <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                    onClick={() => changePage(current - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                    className="px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </button>

                {start > 1 && (
                    <>
                        <button
                            onClick={() => changePage(1)}
                            className="px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                            1
                        </button>
                        {start > 2 && <span className="text-slate-400">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => changePage(page)}
                        disabled={loading}
                        className={`px-3 py-1 rounded border transition-colors ${page === current
                            ? 'bg-slate-600 text-white border-slate-600'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {end < total && (
                    <>
                        {end < total - 1 && <span className="text-slate-400">...</span>}
                        <button
                            onClick={() => changePage(total)}
                            className="px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                            {total}
                        </button>
                    </>
                )}

                <button
                    onClick={() => changePage(current + 1)}
                    disabled={!pagination.hasNextPage || loading}
                    className="px-3 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>
        )
    }

    // Estados de carga y error
    if (initialLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600 font-medium">Cargando historial médico...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar</h2>
                    <p className="text-slate-500 text-center mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchConsultations()}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 cursor-pointer py-1 rounded-md font-medium transition-colors duration-200"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/patients/${id}`)}
                            className="bg-slate-600 hover:bg-slate-700 text-gray-100 px-4 cursor-pointer py-1 rounded-md font-medium transition-colors duration-200"
                        >
                            Volver al Paciente
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Historial Médico
                    </h1>
                    {patient && (
                        <p className="text-slate-600 mt-1">
                            {patient.firstName} {patient.lastName}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/dashboard/patients/${id}`)}
                    className="flex items-start gap-2 cursor-pointer text-slate-600 hover:text-slate-800 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12.293 16.293a1 1 0 01-1.414 0L5.586 11l5.293-5.293a1 1 0 111.414 1.414L8.414 11l3.879 3.879a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Atrás
                </button>
            </div>

            {/* Filtros de fecha */}
            <div className="border-t border-gray-400 flex justify-end items-center gap-4 pt-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 max-w-40">
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full border border-gray-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div className="flex-1 max-w-40">
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full border border-gray-400 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                    <div className="flex gap-4 items-end">
                        <button
                            type="button"
                            onClick={applyFilters}
                            disabled={loading}
                            className="text-sky-600 hover:text-sky-800 text-md font-medium transition-colors duration-200 cursor-pointer"
                        >
                            Filtrar
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            disabled={loading}
                            className="text-sky-600 hover:text-sky-800 text-md font-medium transition-colors duration-200 cursor-pointer"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen de resultados */}
            {pagination.totalCount !== undefined && (
                <div className="text-slate-600 text-sm text-end">
                    {pagination.totalCount === 0
                        ? "No se encontraron consultas"
                        : `Mostrando ${consultations.length} de ${pagination.totalCount} consultas`
                    }
                </div>
            )}

            {/* Lista de consultas (Acordeones) */}
            <div className="space-y-4">
                {loading && consultations.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-6 w-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                        <svg className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-500">No hay consultas registradas</p>
                    </div>
                ) : (
                    consultations.map((consultation) => (
                        <div
                            key={consultation.id}
                            className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                        >
                            {/* Header del acordeón */}
                            <div className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer transition-colors">
                                <div
                                    className="flex-1 flex items-center"
                                    onClick={() => toggleAccordion(consultation.id)}
                                >
                                    <div className="flex items-center">
                                        <svg
                                            className={`h-4 w-4 text-slate-400 transition-transform mr-3 ${expandedConsultation === consultation.id ? 'rotate-90' : ''
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <p className="font-medium text-slate-800">
                                            {new Date(consultation.createdAt).toLocaleString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        openDeleteDialog(consultation.id)
                                    }}
                                    className="cursor-pointer ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Eliminar consulta"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenido del acordeón */}
                            {expandedConsultation === consultation.id && (
                                <div className="border-t border-slate-200 p-6 bg-slate-50">
                                    <div className="space-y-6">
                                        {consultation.findings && (
                                            <div>
                                                <h4 className="font-semibold text-slate-700 mb-2 italic">Datos positivos al examen físico:</h4>
                                                <p className="text-slate-600 whitespace-pre-wrap bg-white p-3 rounded border">
                                                    {consultation.findings}
                                                </p>
                                            </div>
                                        )}

                                        {consultation.diagnosis && (
                                            <div>
                                                <h4 className="font-semibold text-slate-700 mb-2 italic">Diagnóstico:</h4>
                                                <p className="text-slate-600 whitespace-pre-wrap bg-white p-3 rounded border">
                                                    {consultation.diagnosis}
                                                </p>
                                            </div>
                                        )}

                                        {consultation.treatment && (
                                            <div>
                                                <h4 className="font-semibold text-slate-700 mb-2 italic">Plan de Tratamiento:</h4>
                                                <p className="text-slate-600 whitespace-pre-wrap bg-white p-3 rounded border">
                                                    {consultation.treatment}
                                                </p>
                                            </div>
                                        )}

                                        {!consultation.findings && !consultation.diagnosis && !consultation.treatment && (
                                            <p className="text-slate-400 italic">Consulta sin datos médicos registrados</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Paginación */}
            <Pagination />

            {/* Loading overlay */}
            {loading && consultations.length > 0 && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                        <svg className="animate-spin h-6 w-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            )}

            {/* AlertDialog para confirmar eliminación */}
            <AlertDialog />
        </div>
    )
}