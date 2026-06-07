import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const studentId = form.get("studentId") as string;

  if (!file || !studentId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const filename = `${studentId}-${Date.now()}${path.extname(file.name)}`;
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  await writeFile(filepath, Buffer.from(bytes));
  const profileImage = `/uploads/${filename}`;

  await prisma.student.update({ where: { id: studentId }, data: { profileImage } });

  return NextResponse.json({ profileImage });
}
