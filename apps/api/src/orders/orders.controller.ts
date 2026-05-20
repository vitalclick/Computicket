import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { AuthService } from '../auth/auth.service';
import { OrdersService } from './orders.service';

class OrderItemDto {
  @IsString() ticketTypeId!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsOptional() @IsArray() @IsString({ each: true }) seatIds?: string[];
}

class OrderAddOnDto {
  @IsString() addOnId!: string;
  @IsInt() @Min(1) quantity!: number;
}

class CreateOrderDto {
  @IsString() eventSlug!: string;
  @IsEmail() buyerEmail!: string;
  @IsOptional() @IsString() buyerName?: string;
  @IsOptional() @IsString() buyerPhone?: string;
  @IsOptional() @IsString() callbackUrl?: string;
  @IsOptional() @IsString() promoCode?: string;
  @IsOptional() @IsBoolean() payFromWallet?: boolean;
  @IsOptional() @IsString() affiliateCode?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items!: OrderItemDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrderAddOnDto)
  addOns?: OrderAddOnDto[];
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Headers('authorization') authHeader?: string) {
    let userId: string | undefined;
    // Optional auth: if a valid bearer token is present, associate the
    // order with the user. Invalid tokens are silently ignored — guest
    // checkout still works.
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length).trim();
      try {
        const u = await this.auth.verifyToken(token);
        userId = u.id;
      } catch {
        /* ignore */
      }
    }
    return this.orders.create({ ...dto, userId });
  }

  @Get('by-reference/:reference')
  findByReference(@Param('reference') reference: string) {
    return this.orders.findByReference(reference);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }
}
