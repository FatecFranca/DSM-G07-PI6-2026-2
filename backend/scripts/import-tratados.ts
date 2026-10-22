import 'dotenv/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { DataImportService } from '../src/data-import/data-import.service';

async function main(): Promise<void> {
  const [, , climatePath, harvestPath, regionUfPath] = process.argv;
  const prisma = new PrismaService();
  const importer = new DataImportService(prisma);
  try {
    await importer.importTreatedFiles(
      climatePath,
      harvestPath,
      regionUfPath,
    );
    console.log('Arquivos tratados importados com sucesso.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
