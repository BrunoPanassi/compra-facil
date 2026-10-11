import { defineEventHandler, readBody, type H3Event, type EventHandlerRequest, type EventHandler } from 'h3';
import { validatePayload } from './validation';
import { publicError } from './public-error';

export function apiHandler<T extends EventHandlerRequest, R>(handler: EventHandler<T, R>, options?: { validateBody: (body: unknown) => unknown }) {
  return defineEventHandler(async (event: H3Event<T>) => {
    try {
      if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
        if (options) options.validateBody(await readBody<unknown>(event));
        else {
          const parts = event.path.split('?')[0].split('/');
          const entity = parts[2] === 'user' ? parts[3] : parts[2];
          validatePayload(entity, await readBody<unknown>(event), event.method !== 'POST');
        }
      }
      return await handler(event);
    }
    catch (error) { throw publicError(error); }
  });
}
