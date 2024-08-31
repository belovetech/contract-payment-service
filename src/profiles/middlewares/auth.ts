import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfilesService } from '../profiles.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly profileService: ProfilesService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const profileId = this.extractProfileIdFromHeader(request);
    if (!profileId) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.profileService.getProfileById(
        Number(profileId),
      );
      request['profile'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractProfileIdFromHeader(request: Request): string | undefined {
    return request.headers.profile_id as string;
  }
}
