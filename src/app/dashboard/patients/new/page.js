"use client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function HistoriaClinicaForm() {
    const router = useRouter()

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
    const [loading, setLoading] = useState(false)

    // Auto-ajustar altura de todos los textareas al montar
    useEffect(() => {
        const textareas = document.querySelectorAll("textarea")
        textareas.forEach(t => {
            t.style.height = "auto"
            t.style.height = t.scrollHeight + "px"
        })
    }, [])

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })

        // Auto-ajustar altura si es textarea
        if (e.target.tagName === "TEXTAREA") {
            e.target.style.height = "auto"
            e.target.style.height = e.target.scrollHeight + "px"
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!form.firstName || !form.lastName || !form.age || !form.sex || !form.cedula) {
            toast.error("Todos los 'Datos Personales' son obligatorios")
            return
        }

        setLoading(true)

        try {
            const patientRes = await fetch("/api/dashboard/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    age: form.age,
                    sex: form.sex,
                    cedula: form.cedula,
                }),
            })

            if (!patientRes.ok) throw new Error("Error creando paciente")
            const patient = await patientRes.json()

            if (form.findings || form.diagnosis || form.treatment) {
                const consultationRes = await fetch("/api/dashboard/consultations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        patientId: patient.id,
                        findings: form.findings,
                        diagnosis: form.diagnosis,
                        treatment: form.treatment,
                    }),
                })

                if (!consultationRes.ok) throw new Error("Error creando consulta")
                toast.success("👌 Paciente y consulta médica guardados correctamente")
            } else {
                toast.success("👌 Paciente guardado correctamente")
            }

            setTimeout(() => {
                router.push(`/dashboard/patients/${patient.id}`)
            }, 1500)

        } catch (error) {
            console.error(error)
            toast.error("👎 Ocurrió un error al guardar")
        } finally {
            setLoading(false)
        }
    }

    const renderFloatingInput = (name, value, placeholder, type = "text", className = "", rows = null) => {
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

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 p-6">
            {/* Datos personales */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                    <span className="ml-2 text-sm text-red-500 font-normal">*Obligatorio</span>
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {renderFloatingInput(
                        "firstName",
                        form.firstName,
                        "Nombre *",
                        "text",
                        "border border-gray-300 px-2 py-1 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200"
                    )}
                    {renderFloatingInput(
                        "lastName",
                        form.lastName,
                        "Apellidos *",
                        "text",
                        "border border-gray-300 px-2 py-1 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200"
                    )}
                    {renderFloatingInput(
                        "age",
                        form.age,
                        "Edad *",
                        "number",
                        "border border-gray-300 px-2 py-1 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200"
                    )}
                    <div className="relative">
                        <select
                            name="sex"
                            value={form.sex}
                            onChange={handleChange}
                            className="border border-gray-300 px-2 py-1 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200 w-full"
                        >
                            <option value="">Sexo *</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                        {form.sex && (
                            <label className="absolute -top-2 left-2 px-1 bg-white text-xs text-slate-600 font-medium">
                                Sexo *
                            </label>
                        )}
                    </div>
                    <div className="col-span-2">
                        {renderFloatingInput(
                            "cedula",
                            form.cedula,
                            "Cédula de Identidad *",
                            "text",
                            "border border-gray-300 px-2 py-1 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200 w-full"
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
                    Primera Consulta
                    <span className="ml-2 text-sm text-slate-400 font-normal">Opcional</span>
                </h2>
                <div className="space-y-6">
                    {renderFloatingInput(
                        "findings",
                        form.findings,
                        "Datos positivos al examen fisico",
                        "text",
                        "border border-gray-300 p-6 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200 w-full",
                        3
                    )}
                    {renderFloatingInput(
                        "diagnosis",
                        form.diagnosis,
                        "Diagnóstico",
                        "text",
                        "border border-gray-300 p-6 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200 w-full",
                        3
                    )}
                    {renderFloatingInput(
                        "treatment",
                        form.treatment,
                        "Plan de Tratamiento",
                        "text",
                        "border border-gray-300 p-6 rounded focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors duration-200 w-full",
                        3
                    )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                        💡 <strong>Tip:</strong> Puede omitir la información médica y agregarla más tarde editando el perfil del paciente.
                    </p>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 border-slate-200">
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 px-2 py-1 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-600 cursor-pointer hover:bg-slate-700 text-white px-4 py-1 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    )
}
