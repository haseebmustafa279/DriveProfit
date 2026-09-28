#!/usr/bin/env node
'use strict';

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const CONFIRMATION_PREFIX = 'ASSIGN_WORKSPACE:';
const PAGE_SIZE = 500;

function printUsage() {
  console.log(`
Migrate legacy monthly records to an explicit workspace.

Usage:
  node scripts/migrate-monthly-workspace.js --workspace-id father-son --dry-run
  node scripts/migrate-monthly-workspace.js --workspace-id father-son --confirm ASSIGN_WORKSPACE:father-son

Options:
  --workspace-id <id>  Required. Never inferred or guessed.
  --dry-run             Read and report changes without writing.
  --confirm <token>     Required for writes. Must equal ASSIGN_WORKSPACE:<id>.
  --project-id <id>     Optional Firebase project ID.
  --help                Show this help.

Credentials are loaded by Firebase Admin SDK Application Default Credentials.
Use GOOGLE_APPLICATION_CREDENTIALS only as an environment variable pointing to
an external credential file. Never commit credentials or put them in this script.
`);
}

function parseArgs(argv) {
  const options = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      printUsage();
      process.exit(0);
    }
    if (argument === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (argument === '--workspace-id' || argument === '--confirm' || argument === '--project-id') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a value`);
      }
      options[argument.slice(2).replaceAll('-', '')] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function validateOptions(options) {
  if (!options.workspaceid) {
    throw new Error('--workspace-id is required; the script never guesses a workspace ID');
  }
  if (options.dryRun && options.confirm) {
    throw new Error('Use either --dry-run or --confirm, not both');
  }
  if (!options.dryRun && options.confirm !== `${CONFIRMATION_PREFIX}${options.workspaceid}`) {
    throw new Error(`A write requires --confirm ${CONFIRMATION_PREFIX}${options.workspaceid}`);
  }
}

function initializeAdmin(projectId) {
  return initializeApp({
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {}),
  });
}

async function loadWorkspace(db, workspaceId) {
  const workspaceSnapshot = await db.collection('workspaces').doc(workspaceId).get();
  if (!workspaceSnapshot.exists) {
    throw new Error(`Workspace workspaces/${workspaceId} does not exist`);
  }

  const workspace = workspaceSnapshot.data() || {};
  if (
    !Array.isArray(workspace.memberUids)
    || workspace.memberUids.length !== 2
    || new Set(workspace.memberUids).size !== 2
  ) {
    throw new Error(`Workspace workspaces/${workspaceId} must contain exactly two memberUids`);
  }

  const profiles = await Promise.all(
    workspace.memberUids.map(uid => db.collection('users').doc(uid).get())
  );
  if (profiles.some(profile => !profile.exists)) {
    throw new Error('Every workspace member UID must have an existing users profile');
  }

  const roles = profiles.map(profile => profile.data().role).sort();
  if (roles[0] !== 'father' || roles[1] !== 'son') {
    throw new Error('Workspace members must have exactly the father and son roles');
  }
}

async function migrate(options) {
  const app = initializeAdmin(options.projectid);
const db = getFirestore(app);
  await loadWorkspace(db, options.workspaceid);

  const report = { planned: 0, updated: 0, skipped: 0, conflicts: 0, errors: 0 };
  let lastDocument = null;

  console.log(`${options.dryRun ? 'DRY RUN' : 'WRITE'}: monthlyRecords -> workspaceId=${options.workspaceid}`);

  while (true) {
    let query = db.collection('monthlyRecords').orderBy('__name__').limit(PAGE_SIZE);
    if (lastDocument) {
      query = query.startAfter(lastDocument);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    const writes = [];
    for (const document of snapshot.docs) {
      const data = document.data();
      if (Object.prototype.hasOwnProperty.call(data, 'workspaceId')) {
        if (data.workspaceId === options.workspaceid) {
          report.skipped += 1;
          console.log(`SKIP ${document.ref.path}: already assigned`);
        } else {
          report.conflicts += 1;
          console.error(`CONFLICT ${document.ref.path}: existing workspaceId=${String(data.workspaceId)}`);
        }
        continue;
      }

      report.planned += 1;
      console.log(`${options.dryRun ? 'WOULD UPDATE' : 'UPDATE'} ${document.ref.path}`);
      if (!options.dryRun) {
        writes.push(document.ref);
      }
    }

    if (writes.length > 0) {
      const batch = db.batch();
      for (const reference of writes) {
        batch.update(reference, { workspaceId: options.workspaceid });
      }
      try {
        await batch.commit();
        report.updated += writes.length;
      } catch (error) {
        report.errors += writes.length;
        const paths = writes.map(reference => reference.path).join(', ');
        console.error(
          `ERROR writing batch [${paths}]: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    lastDocument = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < PAGE_SIZE) {
      break;
    }
  }

  console.log(
    `Summary: planned=${report.planned}, updated=${report.updated}, skipped=${report.skipped}, conflicts=${report.conflicts}, errors=${report.errors}`
  );

  if (report.conflicts > 0 || report.errors > 0) {
    process.exitCode = 1;
  }
}

(async () => {
  try {
    const options = parseArgs(process.argv.slice(2));
    validateOptions(options);
    await migrate(options);
  } catch (error) {
    console.error(`Migration not run: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
})();
