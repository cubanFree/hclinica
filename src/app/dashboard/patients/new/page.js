"use client"
import { useState } from "react"
import { toast } from "sonner"

export default function HistoriaClinicaForm() {
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

    function handleChange(e) {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    function handleCancel() {
        setForm({
            firstName: "",
            lastName: "",
            age: "",
            sex: "",
            cedula: "",
            findings: "",
            diagnosis: "",
            treatment: "",
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!form.firstName || !form.lastName || !form.age || !form.sex || !form.cedula) {
            toast("Todos los 'Datos Personales' son obligatorios")
            return
        }

        setLoading(true)

        try {
            // 1️⃣ Crear paciente
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
            toast("👌 Paciente guardado.")

            // 2️⃣ Crear consulta si hay datos médicos
            if (form.findings || form.diagnosis || form.treatment) {
                const consultationRes = await fetch("/api/dashboard/consultations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        patientId: patient.id, // 🔑 usar el id recién creado
                        findings: form.findings,
                        diagnosis: form.diagnosis,
                        treatment: form.treatment,
                    }),
                })

                if (!consultationRes.ok) throw new Error("Error creando consulta")
                await consultationRes.json()
                toast("👌 Consulta guardada.")
            }

            // Limpiar formulario
            handleCancel()

        } catch (error) {
            console.error(error)
            toast("👎 Ocurrió un error")

        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
            {/* Datos personales */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Datos personales</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Nombre" className="border border-gray-300 px-2 py-1 rounded" />
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Apellidos" className="border border-gray-300 px-2 py-1 rounded" />
                    <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Edad" className="border border-gray-300 px-2 py-1 rounded" />
                    <select name="sex" value={form.sex} onChange={handleChange} className="border border-gray-300 px-2 py-1 rounded">
                        <option value="">Sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    <input name="cedula" value={form.cedula} onChange={handleChange} placeholder="Cédula" className="border border-gray-300 px-2 py-1 rounded col-span-2" />
                </div>
            </div>

            {/* Datos médicos */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Datos médicos</h2>
                <div className="grid gap-4">
                    <textarea name="findings" value={form.findings} onChange={handleChange} placeholder="Hallazgos" className="border border-gray-300 px-2 py-1 rounded w-full" rows={2} />
                    <textarea name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Diagnóstico" className="border border-gray-300 px-2 py-1 rounded w-full" rows={2} />
                    <textarea name="treatment" value={form.treatment} onChange={handleChange} placeholder="Tratamiento" className="border border-gray-300 px-2 py-1 rounded w-full" rows={2} />
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
                <button disabled={loading} type="button" onClick={() => window.location.href = "/dashboard"} className="px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer">Cancelar</button>
                <button disabled={loading} type="submit" className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-800 border-sky-800 hover:border-sky-800 text-white cursor-pointer">Guardar</button>
            </div>
        </form>
    )
}