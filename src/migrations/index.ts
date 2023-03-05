import { MigrationStatuses } from '@/common';
import { MigrationRepository } from '@/repositories';
import { applicationLogger as logger } from '@/helpers';
import { Migration } from '@/models';
import { BaseApplication } from '@/base';
import { migrationProcesses } from './migration-processes';

export const migration = async (application: BaseApplication) => {
  logger.info('START | Migrate database');
  const migrationRepository: MigrationRepository = await application.getRepository(MigrationRepository);

  for (const mirgation of migrationProcesses) {
    const { name, fn } = mirgation;
    if (!name || !fn) {
      continue;
    }

    let migrated: Migration | null = null;
    let migrateStatus: string = MigrationStatuses.UNKNOWN;

    try {
      migrated = await migrationRepository.findOne({ where: { name } });

      if (migrated && migrated.status === MigrationStatuses.SUCCESS) {
        migrateStatus = migrated.status;
        logger.info('[%s] SKIP | Migrate process', name);
        continue;
      }

      logger.info('[%s] START | Migrate process', name);

      await fn(application);
      migrateStatus = MigrationStatuses.SUCCESS;

      logger.info('[%s] DONE | Migrate process', name);
    } catch (error) {
      migrateStatus = MigrationStatuses.FAIL;
      logger.error('[%s] FAILED | Migrate process | Error: %s', name, error);
    } finally {
      if (migrated) {
        await migrationRepository.updateById(migrated.id, { status: migrateStatus });
      } else {
        await migrationRepository.create({ name, status: migrateStatus });
      }
    }
  }

  logger.info('DONE | Migrate database');
};
