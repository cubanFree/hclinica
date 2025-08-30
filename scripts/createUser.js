import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = "doctor@example.com";   // cambia esto
    const plainPassword = "SuperSeguro123"; // cambia esto
    const name = "Dr. House";             // cambia esto

    // encripta la contraseña
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // crea el usuario
    const user = await prisma.doctor.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });

    console.log("Usuario creado ✅:", user);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
