import { Injectable } from '@nestjs/common';
import { CreateTicketSaleDto } from './dto/create-ticket.sale.dto';
import { UpdateTicketSaleDto } from './dto/update-ticket.sale.dto';

@Injectable()
export class TicketSalesService {
  create(createTicketSaleDto: CreateTicketSaleDto) {
    return 'This action adds a new ticketSale';
  }

  findAll() {
    return `This action returns all ticketSales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticketSale`;
  }

  update(id: number, updateTicketSaleDto: UpdateTicketSaleDto) {
    return `This action updates a #${id} ticketSale`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticketSale`;
  }
}
