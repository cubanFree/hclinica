"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function PatientProfile({ params }) {
    const { data: session } = useSession()
    const doctorId = session?.user?.id
    const router = useRouter()
    const { id } = use(params)

    // Estados principales
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedAt, setUpdatedAt] = useState(null)
    const [originalData, setOriginalData] = useState(null)

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        age: "",
        sex: "",
        cedula: "",
        findings: "",
        diagnosis: "",
        treatment: "",
    })

    // Función para detectar cambios
    const detectChanges = (original, current) => {
        const personalFields = ['firstName', 'lastName', 'age', 'sex', 'cedula']
        const medicalFields = ['findings', 'diagnosis', 'treatment']

        const personalChanged = personalFields.some(field =>
            original[field] !== current[field]
        )

        const medicalChanged = medicalFields.some(field =>
            original[field] !== current[field]
        )

        return { personalChanged, medicalChanged }
    }

    // Auto-ajustar altura
    useEffect(() => {
        const textareas = document.querySelectorAll("textarea")
        textareas.forEach(t => {
            t.style.height = "auto"
            t.style.height = t.scrollHeight + "px"
        })
    }, [form])

    // Traer paciente
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setInitialLoading(true)
                setError(null)

                const res = await fetch(`/api/dashboard/patients/${id}`)

                if (res.status === 404) {
                    setNotFound(true)
                    return
                }

                if (!res.ok) {
                    throw new Error(`Error ${res.status}: ${res.statusText}`)
                }

                const data = await res.json()

                // Obtener la última consulta (si existe)
                const lastConsultation = data.consultations && data.consultations.length > 0
                    ? data.consultations[0]
                    : null

                const patientData = {
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    age: data.age || "",
                    sex: data.sex || "",
                    cedula: data.cedula || "",
                    findings: lastConsultation?.findings || "",
                    diagnosis: lastConsultation?.diagnosis || "",
                    treatment: lastConsultation?.treatment || "",
                }

                setForm(patientData)
                setOriginalData(patientData)
                setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null)
            } catch (err) {
                console.error(err)
                setError(err.message || "Error al cargar el paciente")
            } finally {
                setInitialLoading(false)
            }
        }

        if (id) {
            fetchPatient()
        }
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))

        if (e.target.tagName === "TEXTAREA") {
            e.target.style.height = "auto"
            e.target.style.height = e.target.scrollHeight + "px"
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { personalChanged, medicalChanged } = detectChanges(originalData, form)

            if (!personalChanged && !medicalChanged) {
                toast.info("No hay cambios para guardar")
                setIsEditing(false)
                setLoading(false)
                return
            }

            const res = await fetch(`/api/dashboard/patients/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    doctorId,
                    hasChanges: { personalChanged, medicalChanged }
                }),
            })

            if (!res.ok) throw new Error("Error al guardar cambios")
            const updated = await res.json()

            setOriginalData({ ...form })
            setIsEditing(false)
            setUpdatedAt(updated.patient?.updatedAt ? new Date(updated.patient.updatedAt) : null)

            if (personalChanged && medicalChanged) {
                toast.success("👌 Datos personales actualizados y consulta médica actualizada.")
            } else if (personalChanged) {
                toast.success("👌 Datos personales actualizados correctamente")
            } else if (medicalChanged) {
                toast.success("👌 Nueva consulta médica actualizada correctamente")
            }

        } catch (err) {
            console.error(err)
            toast.error("👎 Error al guardar cambios.")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setForm({ ...originalData })
        setIsEditing(false)
    }

    // Componente para input con floating label - Optimizado para evitar re-renders
    const renderFloatingInput = (name, value, placeholder, type = "text", disabled = false, className = "", rows = null) => {
        const hasValue = value && value.toString().trim() !== ""
        const isTextarea = !!rows

        return (
            <div className="relative">
                {isTextarea ? (
                    <textarea
                        name={name}
                        value={value}
                        onChange={handleChange}
                        placeholder={hasValue ? "" : placeholder}
                        disabled={disabled}
                        className={className}
                        rows={rows}
                        style={{ overflow: 'hidden' }}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        placeholder={hasValue ? "" : placeholder}
                        disabled={disabled}
                        className={className}
                    />
                )}
                {hasValue && (
                    <label className="absolute -top-2 left-2 px-1 bg-white text-xs text-slate-600 font-medium">
                        {placeholder}
                    </label>
                )}
            </div>
        )
    }

    // Estados de carga y error
    if (initialLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-slate-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600 font-medium">Cargando información del paciente...</p>
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">Paciente no encontrado</h2>
                    <p className="text-slate-500 text-center mb-6">
                        El paciente que buscas no existe o no tienes permisos para verlo.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-slate-600 hover:bg-slate-700 text-gray-100 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <svg className="h-16 w-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar</h2>
                    <p className="text-slate-500 text-center mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-slate-600 hover:bg-slate-700 text-gray-100 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 p-6">
            {/* Header con información del paciente */}
            <div className="w-full">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                    {form.firstName || form.lastName
                        ? `${form.firstName} ${form.lastName}`.trim()
                        : "Información del Paciente"
                    }
                </h1>
                {updatedAt && (
                    <p className="text-slate-500 text-sm">
                        Última actualización: {updatedAt.toLocaleString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>

            {/* Datos personales */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {renderFloatingInput(
                        "firstName",
                        form.firstName,
                        "Nombre",
                        "text",
                        !isEditing,
                        "border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    )}
                    {renderFloatingInput(
                        "lastName",
                        form.lastName,
                        "Apellidos",
                        "text",
                        !isEditing,
                        "border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    )}
                    {renderFloatingInput(
                        "age",
                        form.age,
                        "Edad",
                        "number",
                        !isEditing,
                        "border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    )}
                    <div className="relative">
                        <select
                            name="sex"
                            value={form.sex}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75 w-full"
                        >
                            <option value="">Sexo</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                        {form.sex && (
                            <label className="absolute -top-2 left-2 px-1 bg-white text-xs text-slate-600 font-medium">
                                Sexo
                            </label>
                        )}
                    </div>
                    <div className="col-span-2">
                        {renderFloatingInput(
                            "cedula",
                            form.cedula,
                            "Cédula de Identidad",
                            "text",
                            !isEditing,
                            "border border-gray-300 px-2 py-1 rounded disabled:opacity-75 w-full"
                        )}
                    </div>
                </div>
            </div>

            {/* Datos médicos */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Historia Clínica
                </h2>
                <div className="space-y-6">
                    {renderFloatingInput(
                        "findings",
                        form.findings,
                        "Hallazgos Clínicos",
                        "text",
                        !isEditing,
                        "border border-gray-300 p-6 rounded disabled:opacity-75 w-full",
                        3
                    )}
                    {renderFloatingInput(
                        "diagnosis",
                        form.diagnosis,
                        "Diagnóstico",
                        "text",
                        !isEditing,
                        "border border-gray-300 p-6 rounded disabled:opacity-75 w-full",
                        3
                    )}
                    {renderFloatingInput(
                        "treatment",
                        form.treatment,
                        "Plan de Tratamiento",
                        "text",
                        !isEditing,
                        "border border-gray-300 p-6 rounded disabled:opacity-75 w-full",
                        3
                    )}
                </div>
            </div>

            {/* Botones mejorados */}
            <div className="flex justify-end space-x-3 border-slate-200">
                <button
                    type="button"
                    disabled={loading}
                    onClick={isEditing ? handleCancel : () => router.push("/dashboard")}
                    className="bg-slate-500 cursor-pointer hover:bg-slate-600 text-white px-6 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEditing ? "Cancelar" : "Atrás"}
                </button>
                {isEditing ? (
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-slate-600 cursor-pointer hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault()
                            setIsEditing(true)
                        }}
                        className="bg-slate-600 cursor-pointer hover:bg-slate-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Información
                    </button>
                )}
            </div>
        </form>
    )
}