import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { GraphQLError } from "graphql";

function requireAuth(ctx: { user: { id: string } | null }) {
  if (!ctx.user) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHENTICATED" } });
}

export const resolvers = {
  Query: {
    students: (_: unknown, __: unknown, ctx: { user: { id: string } | null }) => {
      requireAuth(ctx);
      return prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    },
    student: (_: unknown, { id }: { id: string }, ctx: { user: { id: string } | null }) => {
      requireAuth(ctx);
      return prisma.student.findUnique({ where: { id } });
    },
  },

  Mutation: {
    register: async (_: unknown, { email, password }: { email: string; password: string }) => {
      try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password: hashed } });
        return { token: signToken({ id: user.id, email: user.email }), email: user.email };
      } catch {
        throw new GraphQLError("Email already registered. Please login.");
      }
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password)))
        throw new GraphQLError("Invalid credentials");
      return { token: signToken({ id: user.id, email: user.email }), email: user.email };
    },

    addStudent: (_: unknown, args: { name: string; email: string; phone?: string; course?: string }, ctx: { user: { id: string } | null }) => {
      requireAuth(ctx);
      return prisma.student.create({ data: args });
    },

    updateStudent: (_: unknown, { id, ...data }: { id: string; name?: string; email?: string; phone?: string; course?: string; profileImage?: string }, ctx: { user: { id: string } | null }) => {
      requireAuth(ctx);
      return prisma.student.update({ where: { id }, data });
    },

    deleteStudent: async (_: unknown, { id }: { id: string }, ctx: { user: { id: string } | null }) => {
      requireAuth(ctx);
      await prisma.student.delete({ where: { id } });
      return true;
    },
  },
};
