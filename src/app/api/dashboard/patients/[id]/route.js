import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
    const { id } = await params
    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            consultations: {
                orderBy: { createdAt: 'desc' }
            }
        },
    })

    if (!patient) {
        return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(patient)
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params
        const data = await req.json()
        const {
            hasChanges,
            doctorId,
            firstName,
            lastName,
            cedula,
            age,
            sex,
            findings,
            diagnosis,
            treatment
        } = data

        let updatedPatient = null
        let newConsultation = null

        // Solo actualizar datos personales si cambiaron
        if (hasChanges?.personalChanged) {
            updatedPatient = await prisma.patient.update({
                where: { id },
                data: {
                    firstName,
                    lastName,
                    cedula,
                    age: parseInt(age) || null,
                    sex,
                    updatedAt: new Date()
                },
            })
        } else {
            // Obtener el paciente actual si no se actualizó
            updatedPatient = await prisma.patient.findUnique({
                where: { id }
            })
        }

        // Solo crear nueva consulta si hay cambios médicos Y contenido
        if (hasChanges?.medicalChanged && (findings || diagnosis || treatment)) {
            newConsultation = await prisma.consultation.create({
                data: {
                    findings: findings || "",
                    diagnosis: diagnosis || "",
                    treatment: treatment || "",
                    patient: {
                        connect: { id } // ✅ Conecta con el paciente existente
                    },
                    doctor: {
                        connect: { id: doctorId } // Conecta con el doctor
                    }
                },
            })
        }

        const response = {
            patient: updatedPatient,
            consultation: newConsultation,
            changes: {
                personalDataUpdated: hasChanges?.personalChanged || false,
                newConsultationCreated: hasChanges?.medicalChanged && (findings || diagnosis || treatment) || false
            }
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error("Error updating patient:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}