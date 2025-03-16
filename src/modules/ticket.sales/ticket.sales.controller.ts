import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketSalesService } from './ticket.sales.service';
import { CreateTicketSaleDto } from './dto/create-ticket.sale.dto';
import { UpdateTicketSaleDto } from './dto/update-ticket.sale.dto';

@Controller('ticket.sales')
export class TicketSalesController {
  constructor(private readonly ticketSalesService: TicketSalesService) {}

  @Post()
  create(@Body() createTicketSaleDto: CreateTicketSaleDto) {
    return this.ticketSalesService.create(createTicketSaleDto);
  }

  @Get()
  findAll() {
    return this.ticketSalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketSalesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketSaleDto: UpdateTicketSaleDto) {
    return this.ticketSalesService.update(+id, updateTicketSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketSalesService.remove(+id);
  }
}
