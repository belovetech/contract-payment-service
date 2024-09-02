import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth';

describe('canActivate', () => {
  it('should allow request to proceed when profile ID is valid', async () => {
    const mockRequest = {
      headers: { profile_id: '123' },
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnThis(),
    };
    const mockContext = {
      switchToHttp: () => mockRequest,
    } as unknown as ExecutionContext;
    const mockProfileService = {
      getProfileById: jest.fn().mockResolvedValue({ id: 123 }),
    };
    const authGuard = new AuthGuard(mockProfileService as any);
    const result = await authGuard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest['profile']).toEqual({ id: 123 });
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(123);
  });

  it('should throw UnauthorizedException when profile ID is missing', async () => {
    const mockRequest = {
      headers: {},
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnThis(),
    };
    const mockContext = {
      switchToHttp: () => mockRequest,
    } as unknown as ExecutionContext;
    const mockProfileService = { getProfileById: jest.fn() };
    const authGuard = new AuthGuard(mockProfileService as any);

    await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
