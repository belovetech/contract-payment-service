import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, profiles_role } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prismaClient/prisma.service';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { profile } from '../test-utils/data.mock';

describe('profileService', () => {
  let service: ProfilesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(ProfilesService);
    prismaMock = module.get(PrismaService);
  });

  describe('create profile', () => {
    it('should create a profile when valid data is provided', async () => {
      const payload: CreateProfileDto = {
        first_name: 'John',
        last_name: 'Doe',
        profession: 'Software Engineer',
        role: profiles_role.client,
      };

      prismaMock.profiles.create.mockResolvedValue(profile);
      await expect(service.create(payload)).resolves.toEqual(profile);
    });

    it('should throw an error when invalid data is provided', async () => {
      const payload: CreateProfileDto = {
        first_name: '',
        last_name: '',
        profession: '',
        role: profiles_role.client,
      };
      prismaMock.profiles.create.mockRejectedValue(new Error());
      await expect(service.create(payload)).rejects.toThrow();
    });
  });
  describe('getProfileById', () => {
    it('should return a profile when a valid id is provided', async () => {
      prismaMock.profiles.findUnique.mockResolvedValue(profile);
      const result = await service.getProfileById(10);
      expect(result.first_name).toEqual(profile.first_name);
      expect(result.last_name).toEqual(profile.last_name);
      expect(result.profession).toEqual(profile.profession);
      expect(result.role).toEqual(profile.role);
    });

    it('should throw an error when an invalid id is provided', async () => {
      prismaMock.profiles.findUnique.mockResolvedValue(null);
      await expect(service.getProfileById(0)).rejects.toThrow();
    });
  });

  describe('getAllProfiles', () => {
    it('should return all profiles when a valid role is provided', async () => {
      prismaMock.profiles.findMany.mockResolvedValue([profile]);
      const result = await service.getAllProfiles(profiles_role.client);
      expect(result).toEqual([profile]);
    });

    it('should return an empty array when an invalid role is provided', async () => {
      prismaMock.profiles.findMany.mockResolvedValue([]);
      const result = await service.getAllProfiles(profiles_role.client);
      expect(result).toEqual([]);
    });
  });
});
