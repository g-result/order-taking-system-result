import type { Prisma, GlobalSettings } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const globalSettingsRepository = {
  async findFirst(): Promise<GlobalSettings | null> {
    return prisma.globalSettings.findFirst()
  },
  async findUnique(id: string): Promise<GlobalSettings | null> {
    return prisma.globalSettings.findUnique({
      where: { id }
    })
  },
  async upsert(
    overrideUsageRestriction: boolean,
    id: string
  ): Promise<GlobalSettings> {
    return prisma.globalSettings.upsert({
      where: { id },
      update: { id, overrideUsageRestriction },
      create: { id, overrideUsageRestriction }
    })
  }
}
