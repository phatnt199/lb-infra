import { MixinTarget } from '@loopback/core';
import { Entity, property } from '@loopback/repository';

export const TzMixin = <E extends MixinTarget<Entity>>(superClass: E) => {
  class Mixed extends superClass {
    @property({
      type: 'date',
      defaultFn: 'now',
      postgresql: {
        columnName: 'created_at',
        dataType: 'TIMESTAMPTZ',
      },
    })
    createdAt: Date;

    @property({
      type: 'date',
      defaultFn: 'now',
      postgresql: {
        columnName: 'modified_at',
        dataType: 'TIMESTAMPTZ',
      },
    })
    modifiedAt: Date;
  }

  return Mixed;
};
