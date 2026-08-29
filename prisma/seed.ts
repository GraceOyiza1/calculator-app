import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cardBoard = await prisma.packagingSpec.upsert({
    where: { materialType: 'Cardboard' },
    update: {},
    create: {
      materialType: 'Cardboard',
      costPerSqFt: 0.15,
      dimensionalDivisor: 139.0,
    },
  })
  
  const rigidPlastic = await prisma.packagingSpec.upsert({
    where: { materialType: 'Rigid Plastic' },
    update: {},
    create: {
      materialType: 'Rigid Plastic',
      costPerSqFt: 0.45,
      dimensionalDivisor: 139.0,
    },
  })

  console.log('Seeded database with PackagingSpecs')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
