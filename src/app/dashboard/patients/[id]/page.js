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
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [updatedAt, setUpdatedAt] = useState(null)
    const [originalData, setOriginalData] = useState(null) // guardar datos originales

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

    // Traer paciente
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`/api/dashboard/patients/${id}`)
                if (!res.ok) throw new Error("Error al obtener paciente")
                const data = await res.json()

                // Obtener la última consulta (si existe)
                const lastConsultation = data.consultations && data.consultations.length > 0
                    ? data.consultations[0]  // ✅ Primer elemento (más reciente por updatedAt)
                    : null

                const patientData = {
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    age: data.age || "",
                    sex: data.sex || "",
                    cedula: data.cedula || "",
                    // Datos de la última consulta
                    findings: lastConsultation?.findings || "",
                    diagnosis: lastConsultation?.diagnosis || "",
                    treatment: lastConsultation?.treatment || "",
                }

                setForm(patientData)
                setOriginalData(patientData)
                setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null)
            } catch (err) {
                console.error(err)
            }
        }
        fetchPatient()
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Detectar qué cambió
            const { personalChanged, medicalChanged } = detectChanges(originalData, form)

            // Si no hay cambios, no hacer nada
            if (!personalChanged && !medicalChanged) {
                toast.info("ℹ️ No hay cambios para guardar")
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

            setOriginalData({ ...form }) // actualizar datos originales
            setIsEditing(false)
            setUpdatedAt(updated.patient?.updatedAt ? new Date(updated.patient.updatedAt) : null)

            // Mostrar mensajes específicos según qué se actualizó
            if (personalChanged && medicalChanged) {
                toast.success("👌 Datos personales actualizados y consulta médica actualizada.")
            } else if (personalChanged) {
                toast.success("👌 Datos personales actualizados correctamente")
            } else if (medicalChanged) {
                toast.success("👌 Nueva consulta médica actualizada correctamente")
            }

        } catch (err) {
            console.error(err)
            toast.error("👎Error al guardar cambios.")
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setForm({ ...originalData }) // restaurar datos originales
        setIsEditing(false)
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
            {/* Fecha de última actualización */}
            {updatedAt && (
                <p className="text-right text-gray-500 text-sm">
                    Última actualización: {updatedAt.toLocaleString()}
                </p>
            )}

            {/* Datos personales */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Datos personales</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Nombre"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    />
                    <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Apellidos"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    />
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="Edad"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    />
                    <select
                        name="sex"
                        value={form.sex}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75"
                    >
                        <option value="">Sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    <input
                        name="cedula"
                        value={form.cedula}
                        onChange={handleChange}
                        placeholder="Cédula"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75 col-span-2"
                    />
                </div>
            </div>

            {/* Datos médicos */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Datos médicos</h2>
                <div className="grid gap-4">
                    <textarea
                        name="findings"
                        value={form.findings}
                        onChange={handleChange}
                        placeholder="Hallazgos"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75 w-full"
                        rows={2}
                    />
                    <textarea
                        name="diagnosis"
                        value={form.diagnosis}
                        onChange={handleChange}
                        placeholder="Diagnóstico"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75 w-full"
                        rows={2}
                    />
                    <textarea
                        name="treatment"
                        value={form.treatment}
                        onChange={handleChange}
                        placeholder="Tratamiento"
                        disabled={!isEditing}
                        className="border border-gray-300 px-2 py-1 rounded disabled:opacity-75 w-full"
                        rows={2}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    disabled={loading}
                    onClick={isEditing ? handleCancel : () => router.push("/dashboard")}
                    className="px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer disabled:opacity-50"
                >
                    {isEditing ? "Cancelar" : "Atrás"}
                </button>
                {isEditing ? (
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-800 border-sky-800 hover:border-sky-800 text-white cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Espera..." : "Guardar"}
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsEditing(true);
                        }}
                        className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-800 border-sky-800 hover:border-sky-800 text-white cursor-pointer"
                    >
                        Modificar
                    </button>
                )}
            </div>
        </form>
    )
}