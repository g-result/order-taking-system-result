import type { Prisma, User, ApprovalStatus } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const userRepository = {
  async create(data: Prisma.UserCreateManyInput): Promise<User> {
    return prisma.user.create({ data })
  },

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      where: { roleType: 'USER' },
      orderBy: { id: 'asc' }
    })
  },

  async findMany({
    page,
    pageSize
  }: {
    page: number
    pageSize: number
  }): Promise<{ users: User[]; total: number }> {
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where: { roleType: 'USER' },
        orderBy: { id: 'asc' }
      }),
      prisma.user.count({
        where: { roleType: 'USER' }
      })
    ])
    return { users, total }
  },

  async findUnique(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  },
  async findByPasswordResetToken(
    passwordResetToken: string
  ): Promise<User | null> {
    return prisma.user.findUnique({
      where: { passwordResetToken }
    })
  },

  async update({
    id,
    data
  }: { id: string; data: Prisma.UserUpdateInput }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    })
  },

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id }
    })
  },

  async approve({
    id,
    approvalStatus
  }: { id: string; approvalStatus: ApprovalStatus }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { approvalStatus }
    })
  }
}
