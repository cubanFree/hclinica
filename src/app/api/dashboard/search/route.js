// app/api/dashboard/search/route.js
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")

    if (!query) {
        return NextResponse.json([])
    }

    try {
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { cedula: { contains: query } },
                ],
            },
            include: {
                consultations: { orderBy: { updatedAt: "desc" }, take: 1 },
            },
            take: 10, // máximo 10 resultados
        })

        return NextResponse.json(patients)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Error al buscar pacientes" }, { status: 500 })
    }
}
