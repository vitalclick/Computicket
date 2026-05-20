import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrdersService } from './orders.service';

class OrderItemDto {
  @IsString() ticketTypeId!: string;
  @IsInt() @Min(1) quantity!: number;
}

class CreateOrderDto {
  @IsString() eventSlug!: string;
  @IsEmail() buyerEmail!: string;
  @IsOptional() @IsString() buyerName?: string;
  @IsOptional() @IsString() buyerPhone?: string;
  @IsOptional() @IsString() callbackUrl?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
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
