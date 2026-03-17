/* eslint-disable no-console */
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const DEFAULT_KEEP = ["users", "crmusers"];

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const name = token.slice(2);
    const next = argv[i + 1];

    if (next && !next.startsWith("--")) {
      args.set(name, next);
      i += 1;
    } else {
      flags.add(name);
    }
  }

  return { args, flags };
}

function printHelp() {
  console.log(`
Purge non-user collections from MongoDB (safe by default).

Usage:
  node scripts/purgeDummyData.js --dry-run
  node scripts/purgeDummyData.js --confirm

Options:
  --keep <csv>    Collections to keep (default: ${DEFAULT_KEEP.join(",")})
  --uri <uri>     Override Mongo connection string (defaults to MONGO_URI from .env)
  --dry-run       Print what would be deleted (default unless --confirm)
  --confirm       Actually delete documents (requires explicit flag)
  --help          Show this help
`);
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));

  if (flags.has("help")) {
    printHelp();
    return;
  }

  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  const uri = args.get("uri") || process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing Mongo connection string. Set MONGO_URI in server/.env or pass --uri.");
  }

  const keepList = (args.get("keep") || DEFAULT_KEEP.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const keep = new Set(keepList);

  const confirm = flags.has("confirm");
  const dryRun = flags.has("dry-run") || !confirm;

  await mongoose.connect(uri);

  try {
    const { db, name: dbName, host } = mongoose.connection;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const collectionNames = collections.map((item) => item.name).sort();

    const targets = collectionNames.filter((collectionName) => !keep.has(collectionName));

    console.log(`Connected: db=${dbName} host=${host}`);
    console.log(`Keep collections: ${Array.from(keep).sort().join(", ") || "(none)"}`);
    console.log(`Found collections: ${collectionNames.length}`);

    if (!targets.length) {
      console.log("Nothing to purge (no collections outside keep-list).");
      return;
    }

    const counts = [];
    for (const collectionName of targets) {
      // eslint-disable-next-line no-await-in-loop
      const count = await db.collection(collectionName).countDocuments({});
      counts.push({ collectionName, count });
    }

    console.log("");
    console.log("Purge plan:");
    for (const item of counts) {
      console.log(`- ${item.collectionName}: ${item.count} document(s)`);
    }

    if (dryRun) {
      console.log("");
      console.log("Dry-run: no data was deleted. Re-run with --confirm to execute.");
      return;
    }

    console.log("");
    console.log("Executing purge...");
    for (const item of counts) {
      // eslint-disable-next-line no-await-in-loop
      const result = await db.collection(item.collectionName).deleteMany({});
      console.log(`- ${item.collectionName}: deleted ${result.deletedCount} document(s)`);
    }

    console.log("");
    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

