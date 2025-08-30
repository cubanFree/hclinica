// app/api/dashboard/recent/route.js
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get("doctorId")

    if (!doctorId) {
        return NextResponse.json({ error: "doctorId requerido" }, { status: 400 })
    }

    try {
        // Paso 1: Obtener los 3 pacientes más recientemente actualizados del doctor
        const recentPatients = await prisma.patient.findMany({
            where: { doctorId },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            select: { id: true }
        })

        if (recentPatients.length === 0) {
            return NextResponse.json([])
        }

        const patientIds = recentPatients.map(p => p.id)

        // Paso 2: Para cada uno de esos pacientes, obtener su consulta más actualizada
        const lastRecords = await prisma.$queryRaw`
            SELECT DISTINCT ON (c."patientId") 
                c.id,
                c."patientId",
                c.diagnosis,
                c."createdAt",
                c."updatedAt",
                p.id as patient_id,
                p."firstName",
                p."lastName",
                p.age,
                p.sex,
                p.cedula,
                p."createdAt" as patient_created_at,
                p."updatedAt" as patient_updated_at
            FROM "Consultation" c
            INNER JOIN "Patient" p ON c."patientId" = p.id
            WHERE c."patientId" = ANY(${patientIds})
            ORDER BY c."patientId", c."updatedAt" DESC
        `

        // Paso 3: Formatear y ordenar por paciente más actualizado primero
        const formattedRecords = lastRecords
            .map(record => ({
                id: record.id,
                patientId: record.patientId,
                diagnosis: record.diagnosis,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                patient: {
                    id: record.patient_id,
                    firstName: record.firstName,
                    lastName: record.lastName,
                    age: record.age,
                    sex: record.sex,
                    cedula: record.cedula,
                    createdAt: record.patient_created_at,
                    updatedAt: record.patient_updated_at
                }
            }))
            .sort((a, b) => new Date(b.patient.updatedAt) - new Date(a.patient.updatedAt))

        return NextResponse.json(formattedRecords)

    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Error al obtener consultas" }, { status: 500 })
    }
}