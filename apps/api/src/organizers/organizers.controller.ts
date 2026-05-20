import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { OrganizersService } from './organizers.service';

class CreateOrganizerDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
  @IsOptional() @IsString() description?: string;
  @IsEmail() ownerEmail!: string;
  @IsOptional() @IsString() ownerName?: string;
  @IsOptional() @IsString() ownerPhone?: string;
}

@ApiTags('organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizers: OrganizersService) {}

  @Post()
  create(@Body() dto: CreateOrganizerDto) {
    return this.organizers.create(dto);
  }

  @Get()
  list() {
    return this.organizers.list();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.organizers.findBySlug(slug);
  }
}
