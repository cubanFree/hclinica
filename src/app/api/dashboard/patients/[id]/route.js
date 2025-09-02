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
            treatment,
            actionType = 'edit' // 'edit' o 'new-consultation'
        } = data

        let updatedPatient = null
        let consultation = null
        let isNewConsultation = false

        // Actualizar datos personales si cambiaron
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

        // Lógica según el tipo de acción
        if (hasChanges?.medicalChanged && (findings || diagnosis || treatment)) {
            if (actionType === 'new-consultation') {
                // ✅ CREAR NUEVA CONSULTA
                consultation = await prisma.consultation.create({
                    data: {
                        findings: findings || "",
                        diagnosis: diagnosis || "",
                        treatment: treatment || "",
                        patient: {
                            connect: { id }
                        },
                        doctor: {
                            connect: { id: doctorId }
                        }
                    },
                })
                isNewConsultation = true
            } else {
                // ✅ EDITAR ÚLTIMA CONSULTA EXISTENTE
                const lastConsultation = await prisma.consultation.findFirst({
                    where: { patientId: id },
                    orderBy: { createdAt: 'desc' }
                })

                if (lastConsultation) {
                    consultation = await prisma.consultation.update({
                        where: { id: lastConsultation.id },
                        data: {
                            findings: findings || "",
                            diagnosis: diagnosis || "",
                            treatment: treatment || "",
                            updatedAt: new Date()
                        }
                    })
                } else {
                    // Si no hay consulta previa, crear una nueva
                    consultation = await prisma.consultation.create({
                        data: {
                            findings: findings || "",
                            diagnosis: diagnosis || "",
                            treatment: treatment || "",
                            patient: {
                                connect: { id }
                            },
                            doctor: {
                                connect: { id: doctorId }
                            }
                        },
                    })
                    isNewConsultation = true
                }
            }
        }

        const response = {
            patient: updatedPatient,
            consultation,
            changes: {
                personalDataUpdated: hasChanges?.personalChanged || false,
                medicalDataUpdated: hasChanges?.medicalChanged && (findings || diagnosis || treatment) || false,
                isNewConsultation
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