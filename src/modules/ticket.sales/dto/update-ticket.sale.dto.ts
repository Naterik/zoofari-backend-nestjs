import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketSaleDto } from './create-ticket.sale.dto';

export class UpdateTicketSaleDto extends PartialType(CreateTicketSaleDto) {}
