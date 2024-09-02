import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, profiles_role } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prismaClient/prisma.service';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { CreateProfileDto } from './dto/create-profile.dto';
import { BadRequestException } from '@nestjs/common';
import { EmptyLogger } from '../test-utils/empty.logger';
import { profile } from '../test-utils/data.mock';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    prismaMock = module.get(PrismaService);

    module.useLogger(new EmptyLogger());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a profile when valid data is provided', async () => {
    const payload: CreateProfileDto = {
      first_name: 'John',
      last_name: 'Doe',
      profession: 'Software Engineer',
      role: 'client',
    };

    prismaMock.profiles.create.mockResolvedValue(profile);
    await expect(controller.create(payload)).resolves.toEqual({
      message: 'Profile created successfully',
      data: profile,
    });
  });

  it('should throw bad request error when invalid data is provided', async () => {
    const payload: CreateProfileDto = {
      first_name: '',
      last_name: '',
      profession: '',
      role: 'client',
    };
    prismaMock.profiles.create.mockRejectedValue(new BadRequestException());
    await expect(controller.create(payload)).rejects.toThrow();
  });

  describe('getAllProfiles', () => {
    it('should return profiles when a valid role is provided', async () => {
      const role = 'client';
      prismaMock.profiles.findMany.mockResolvedValue([profile]);
      const result = await controller.getAllProfiles({ role });
      expect(result.data).toEqual([profile]);
    });

    it('should throw bad request error when invalid role is provided', async () => {
      const role = 'invalid' as profiles_role;
      prismaMock.profiles.findMany.mockRejectedValue(new BadRequestException());
      await expect(controller.getAllProfiles({ role })).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return a profile when a valid id is provided', async () => {
      const result = await controller.getProfile({ profile });
      expect(result.data).toEqual(profile);
    });

    // it('should throw unauthorized error if profile id is not included in the header', async () => {
    //   prismaMock.profiles.findUnique.mockRejectedValue(
    //     new UnauthorizedException(),
    //   );
    //   await expect(controller.getProfile({ profile: null })).rejects.toThrow();
    // });
  });
});
