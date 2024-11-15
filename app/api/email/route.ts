import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface EmailRequest {
  to: string;
  subject: string;
  htmlPath: string; // La ruta del archivo HTML en la carpeta public
}

export async function POST(request: Request) {
  try {
    const { to, subject, htmlPath }: EmailRequest = await request.json();

    if (!to || !subject || !htmlPath) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Construye la ruta completa al archivo HTML en la carpeta public
    const filePath = path.join(process.cwd(), "emails", htmlPath);

    // Verifica si el archivo HTML existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "Archivo HTML no encontrado" },
        { status: 404 }
      );
    }

    // Lee el contenido del archivo HTML
    const htmlContent = fs.readFileSync(filePath, "utf-8");

    // Configura el transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envía el correo electrónico con el HTML leído como cuerpo
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return NextResponse.json(
      { message: "Error al enviar el correo", error },
      { status: 500 }
    );
  }
}
