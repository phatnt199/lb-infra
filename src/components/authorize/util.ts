import { EnforcerDefinitions } from '@/common';
import { applicationLogger } from '@/helpers';
import { MetadataMap } from '@loopback/core';
import { getDecoratorData, MetadataDecoratorKeys } from './decorator';
import { Permission } from '@/models';
import { PermissionRepository } from '@/repositories';
import union from 'lodash/union';

//---------------------------------------------------------------------------
export interface IPermission {
  code: string;
  subject: string;
  action: string;
  scope: string;
  name: string;
  parentId: number;
  pType: string;
  details?: Record<string, unknown>;
}

export class GeneratePermissionService {
  getMethodsClass(controllerPrototype: object) {
    return Reflect.ownKeys(controllerPrototype).slice(1) as string[];
  }
  async generateParentPermissions(opts: { controller: Function; permissionRepository: PermissionRepository }) {
    const { controller, permissionRepository } = opts ?? {};
    const controllerName = controller.name;
    const permissionSubject = controllerName.replace(/Controller/g, '')?.toLowerCase();

    const parentPermissions = {
      name: `All permissions of ${permissionSubject}`,
      code: `${permissionSubject}.*`,
      subject: permissionSubject,
      action: EnforcerDefinitions.ACTION_EXECUTE,
      pType: 'p',
    };

    applicationLogger.info('[Migrate Permissions] Migration permissions for: %s', controllerName);
    await permissionRepository.upsertWith({ ...parentPermissions }, { code: parentPermissions.code });
  }

  generatePermissions(opts: {
    methods: string[];
    permissionSubject: string;
    parentId: number;
    allPermissionDecoratorData: MetadataMap<unknown> | object | any;
  }) {
    const { methods, permissionSubject, parentId, allPermissionDecoratorData } = opts ?? {};

    return methods.map(m => {
      return {
        name: `Permission ${m} ${permissionSubject}`,
        code: `${permissionSubject}.${m}`,
        subject: permissionSubject,
        action: EnforcerDefinitions.ACTION_EXECUTE,
        scope: m.match(/get|find|search/gim) ? EnforcerDefinitions.ACTION_READ : EnforcerDefinitions.ACTION_WRITE,
        pType: 'p',
        parentId,
        details: allPermissionDecoratorData?.[m] as Record<string, unknown>,
      };
    }) as IPermission[];
  }

  generatePermissionBaseInherit = (opts: {
    methodsParentsMethods: string[];
    methodsChildClass: string[];
    parentPermission: Permission;
    allPermissionDecoratorData: MetadataMap<unknown> | object;
  }) => {
    const { methodsChildClass, methodsParentsMethods, parentPermission, allPermissionDecoratorData } = opts ?? {};

    const defaultPermissions = [
      'count',
      'create',
      'find',
      'findOne',
      'findById',
      'replaceById',
      'updateById',
      'deleteById',
      'updateAll',
    ];

    // Controller not extended from any class
    if (methodsParentsMethods.includes('__proto__')) {
      return this.generatePermissions({
        methods: methodsChildClass,
        permissionSubject: parentPermission.subject,
        parentId: parentPermission.id,
        allPermissionDecoratorData,
      });
    }

    // Controller is extended from CrudController
    return this.generatePermissions({
      methods: union(defaultPermissions, methodsChildClass),
      permissionSubject: parentPermission.subject,
      parentId: parentPermission.id,
      allPermissionDecoratorData,
    });
  };

  generatePermissionRecords(opts: {
    controller: Function;
    parentPermission: Permission;
    permissionRepository: PermissionRepository;
    allPermissionDecoratorData: MetadataMap<unknown> | object;
  }) {
    const { controller, parentPermission, allPermissionDecoratorData } = opts;
    const permissionRecords: IPermission[] = [];
    const controllerPrototype = controller.prototype;
    const methodsChildClass = this.getMethodsClass(controllerPrototype);

    const parentClass = Reflect.getPrototypeOf(controllerPrototype) as object;
    const methodsParentsMethods = this.getMethodsClass(parentClass);

    permissionRecords.push(
      ...this.generatePermissionBaseInherit({
        methodsParentsMethods,
        methodsChildClass,
        parentPermission,
        allPermissionDecoratorData,
      }),
    );

    return permissionRecords;
  }

  async updatePermissionByChangeMethodName(
    permissionSubject: string,
    allPermissionDecoratorData: Record<string, { idx: string }>,
    permissionRepository: PermissionRepository,
  ) {
    if (!Object.values(allPermissionDecoratorData).length) {
      return;
    }

    const allPermissionDecorators = Object.entries(allPermissionDecoratorData);

    for (const [key, value] of allPermissionDecorators) {
      const permissionsFound: Permission[] = await permissionRepository.find({
        where: {
          subject: permissionSubject,
          code: {
            neq: `${permissionSubject}.*`,
          },
        },
      });

      for (const p of permissionsFound) {
        if (!p?.details?.idx || p?.details?.idx !== value.idx) {
          continue;
        }

        await permissionRepository.updateById(p.id, {
          ...p,
          code: `${permissionSubject}.${key}`,
          details: { ...value },
        });
      }
    }
  }

  async startMigration(opts: { permissionRepository: any; controllers: object }) {
    const { permissionRepository, controllers } = opts;
    const permissions: IPermission[] = [];

    for (const controller of Object.values(controllers)) {
      const controllerClass = controller as Function;
      const permissionSubject = controllerClass.name.replace(/Controller/g, '');
      const controllerPrototype = controllerClass.prototype;
      const permissionSubjectLowerCase = permissionSubject?.toLowerCase();

      applicationLogger.info('[Migrate Permissions] Migration permissions for: %s', permissionSubject);

      await this.generateParentPermissions({ controller, permissionRepository });

      const parentPermission = await permissionRepository.findOne({
        where: { subject: permissionSubjectLowerCase },
      });

      if (!parentPermission) {
        continue;
      }

      const allPermissionDecoratorData: Record<string, { idx: string }> =
        getDecoratorData(controllerPrototype, MetadataDecoratorKeys.PERMISSION) ?? {};

      const permissionList = this.generatePermissionRecords({
        controller: controllerClass,
        parentPermission,
        permissionRepository,
        allPermissionDecoratorData,
      });

      await this.updatePermissionByChangeMethodName(
        permissionSubjectLowerCase,
        allPermissionDecoratorData,
        permissionRepository,
      );

      permissions.push(...permissionList);
    }

    await Promise.all(
      permissions.map(async p => {
        await permissionRepository.upsertWith(p, { code: p.code });
      }),
    );
  }
}
