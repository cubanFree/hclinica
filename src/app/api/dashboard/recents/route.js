// app/api/dashboard/recent/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
        return NextResponse.json({ error: "doctorId requerido" }, { status: 400 });
    }

    try {
        // Obtener las últimas consultas de cada paciente y limitar a 3 pacientes distintos
        const lastRecords = await prisma.$queryRaw`
      SELECT *
      FROM (
        SELECT c.id,
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
               p."updatedAt" as patient_updated_at,
               ROW_NUMBER() OVER (PARTITION BY c."patientId" ORDER BY c."updatedAt" DESC) as rn
        FROM "Consultation" c
        INNER JOIN "Patient" p ON c."patientId" = p.id
        WHERE p."doctorId" = ${doctorId}
      ) sub
      WHERE rn = 1
      ORDER BY "updatedAt" DESC
      LIMIT 3;
    `;

        const formattedRecords = lastRecords.map(record => ({
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
        }));

        return NextResponse.json(formattedRecords);

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Error al obtener consultas" }, { status: 500 });
    }
}
