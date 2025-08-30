import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const { firstName, lastName, cedula, age, sex } = body

    try {
        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                cedula,
                age: Number(age),
                sex,
                doctorId: session.user.id, // relacionar con el doctor
            },
        })

        return NextResponse.json(patient)

    } catch (error) {
        return NextResponse.json({ error: "Error creando paciente" }, { status: 500 })
    }
}
