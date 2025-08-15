// serverNew/tests/middleware.test.ts
import type { Request, Response, NextFunction } from 'express';
// Pfad ggf. anpassen: '../middleware/middleware' oder '../middleware/requireAuth'
import { requireAuth } from '../middleware/middleware';

function mockRes(): Response {
    const res = {} as unknown as Response;
    // chainable Mocks
    (res.status as any) = jest.fn().mockReturnValue(res);
    (res.json as any)   = jest.fn().mockReturnValue(res);
    return res;
}

describe('requireAuth middleware', () => {
    test('lässt durch, wenn session.userId gesetzt ist', () => {
        const req = { session: { userId: 'u1' } } as unknown as Request;
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        requireAuth(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect((res.status as any)).not.toHaveBeenCalled();
        expect((res.json as any)).not.toHaveBeenCalled();
    });

    test('blockiert mit 401, wenn session existiert aber kein userId', () => {
        const req = { session: {} } as unknown as Request;
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        requireAuth(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect((res.status as any)).toHaveBeenCalledWith(401);
        expect((res.json as any)).toHaveBeenCalledWith({
            success: false,
            message: 'Authentication required. Please log in.',
        });
    });

    test('blockiert mit 401, wenn keine session vorhanden ist', () => {
        const req = {} as unknown as Request; // session ist undefined
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        requireAuth(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect((res.status as any)).toHaveBeenCalledWith(401);
        expect((res.json as any)).toHaveBeenCalledWith({
            success: false,
            message: 'Authentication required. Please log in.',
        });
    });
});
