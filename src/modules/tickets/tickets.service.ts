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
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<any> {
    try {
      const ticket = this.ticketsRepository.create(createTicketDto);
      const savedTicket = await this.ticketsRepository.save(ticket);
      return { id: savedTicket.id, message: "Tạo ticket thành công" };
    } catch (e) {
      throw new BadRequestException("Có lỗi xảy ra khi tạo ticket");
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Ticket>> {
    return await paginate(query, this.ticketsRepository, {
      sortableColumns: ["id", "type", "price"],
      defaultSortBy: [["id", "DESC"]],
      searchableColumns: ["type"],
      select: ["id", "type", "price", "description"],
    });
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ["ticketSales", "images"],
    });
    if (!ticket)
      throw new NotFoundException(`Ticket với ID ${id} không tồn tại`);
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<any> {
    try {
      const result = await this.ticketsRepository.update(id, updateTicketDto);
      if (result.affected === 0)
        throw new NotFoundException(`Ticket với ID ${id} không tồn tại`);
      const updatedTicket = await this.ticketsRepository.findOne({
        where: { id },
      });
      return { message: "Cập nhật ticket thành công", ticket: updatedTicket };
    } catch (e) {
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật ticket");
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const result = await this.ticketsRepository.delete(id);
      if (result.affected === 0)
        throw new NotFoundException(`Ticket với ID ${id} không tồn tại`);
      return { message: "Xóa ticket thành công", affected: result.affected };
    } catch (e) {
      throw new BadRequestException("Có lỗi xảy ra khi xóa ticket");
    }
  }
}
