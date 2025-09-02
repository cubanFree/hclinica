import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
    try {
        const { id } = await params
        const { searchParams } = new URL(req.url)

        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        // Verificar que el paciente existe
        const patient = await prisma.patient.findUnique({
            where: { id },
            select: { id: true, firstName: true, lastName: true }
        })

        if (!patient) {
            return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
        }

        // Construir filtros de fecha
        let dateFilter = {}
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate + 'T23:59:59.999Z') // Final del día
                }
            }
        } else if (startDate) {
            dateFilter = {
                createdAt: {
                    gte: new Date(startDate)
                }
            }
        } else if (endDate) {
            dateFilter = {
                createdAt: {
                    lte: new Date(endDate + 'T23:59:59.999Z')
                }
            }
        }

        // Obtener consultas con paginación
        const [consultations, totalCount] = await Promise.all([
            prisma.consultation.findMany({
                where: {
                    patientId: id,
                    ...dateFilter
                },
                include: {
                    doctor: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.consultation.count({
                where: {
                    patientId: id,
                    ...dateFilter
                }
            })
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json({
            patient,
            consultations,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        })

    } catch (error) {
        console.error("Error fetching consultations:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params // patientId
        const { searchParams } = new URL(req.url)
        const consultationId = searchParams.get('consultationId')

        if (!consultationId) {
            return NextResponse.json({ error: "ID de consulta requerido" }, { status: 400 })
        }

        // Verificar que la consulta pertenece al paciente
        const consultation = await prisma.consultation.findFirst({
            where: {
                id: consultationId,
                patientId: id
            }
        })

        if (!consultation) {
            return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 })
        }

        // Eliminar la consulta
        await prisma.consultation.delete({
            where: { id: consultationId }
        })

        return NextResponse.json({ message: "Consulta eliminada correctamente" })

    } catch (error) {
        console.error("Error deleting consultation:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}