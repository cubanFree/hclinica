import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    try {
        const body = await req.json()
        const { patientId, findings, diagnosis, treatment } = body

        if (!patientId || (!findings && !diagnosis && !treatment)) {
            return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
        }

        const consultation = await prisma.consultation.create({
            data: {
                patient: {
                    connect: { id: patientId } // 🔑 conectar con el paciente recién creado
                },
                doctor: { connect: { id: session.user.id } }, // 🔑 conectar al doctor que está logueado
                findings: findings || "",
                diagnosis: diagnosis || "",
                treatment: treatment || "",
            },
        })

        return NextResponse.json(consultation)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Error creando consulta" }, { status: 500 })
    }
}
