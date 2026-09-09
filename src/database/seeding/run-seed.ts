import "reflect-metadata";
import "dotenv/config";
import { runSeeders } from "typeorm-extension";

import { dataSource } from "../data-source";

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    !process.argv.includes("--force")
  ) {
    console.error(
      "Refus d'exécuter le seeder en production. Utilise --force si tu es sûr.",
    );
    process.exit(1);
  }

  await dataSource.initialize();
  try {
    await runSeeders(dataSource);
    console.log("\nSeeding terminé ✅");
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error("Seeder en échec :", err);
  process.exit(1);
});
