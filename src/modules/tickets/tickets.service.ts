import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Ticket } from "./entities/ticket.entity";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { PaginateQuery } from "nestjs-paginate";

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    try {
      const { type, price, description } = createTicketDto;

      const ticket = this.ticketsRepository.create({
        type,
        price,
        description,
      });

      const savedTicket = await this.ticketsRepository.save(ticket);
      return {
        id: savedTicket.id,
        message: "Tạo ticket thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo ticket");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [tickets, total] = await this.ticketsRepository
        .createQueryBuilder("ticket")
        .leftJoinAndSelect("ticket.ticketSales", "ticketSales")
        .select([
          "ticket.id",
          "ticket.type",
          "ticket.price",
          "ticket.description",
          "ticketSales.id",
          "ticketSales.quantity",
          "ticketSales.total_price",
          "ticketSales.sale_date",
          "ticketSales.status",
        ])
        .skip(skip)
        .take(limit)
        .orderBy("ticket.id", "DESC")
        .getManyAndCount();

      return {
        data: tickets,
        meta: {
          totalItems: total,
          itemCount: tickets.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch tickets");
    }
  }

  async findOne(id: number) {
    const ticket = await this.ticketsRepository
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.ticketSales", "ticketSales")
      .where("ticket.id = :id", { id })
      .getOne();

    if (!ticket) {
      throw new NotFoundException(`Ticket với id ${id} không tồn tại`);
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    try {
      const ticket = await this.ticketsRepository.findOne({
        where: { id },
      });
      if (!ticket) {
        throw new NotFoundException(`Ticket với id ${id} không tồn tại`);
      }

      const { type, price, description } = updateTicketDto;

      const updateTicketData: Partial<Ticket> = {
        type: type ?? ticket.type,
        price: price ?? ticket.price,
        description: description ?? ticket.description,
      };

      await this.ticketsRepository.save({ ...ticket, ...updateTicketData });
      const updatedTicket = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        ticket: updatedTicket,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật ticket");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.ticketsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa ticket thất bại");
      }
      return {
        message: "Xóa ticket thành công",
        affected: result.affected as number,
      };
    } catch (e) {
      throw e;
    }
  }
}
