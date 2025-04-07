import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Event } from "./entities/event.entity";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { PaginateQuery } from "nestjs-paginate";
import { Enclosure } from "../enclosures/entities/enclosure.entity";
import { News } from "../news/entities/news.entity";
import dayjs from "dayjs";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Enclosure)
    private enclosuresRepository: Repository<Enclosure>,
    @InjectRepository(News)
    private newsRepository: Repository<News>
  ) {}

  // Hàm tiện ích để xác định status dựa trên start_date và end_date
  private determineStatus(start_date: Date, end_date: Date): string {
    const now = dayjs();
    const start = dayjs(start_date);
    const end = dayjs(end_date);

    if (start.isAfter(now)) {
      return "upcoming";
    } else if (start.isBefore(now) && end.isAfter(now)) {
      return "ongoing";
    } else {
      return "finished";
    }
  }

  async create(createEventDto: CreateEventDto) {
    try {
      const {
        enclosure_id,
        news_id,
        start_date,
        end_date,
        status,
        ...eventData
      } = createEventDto;

      // Validate enclosure (required)
      const enclosure: Enclosure | null =
        await this.enclosuresRepository.findOne({
          where: { id: enclosure_id },
        });
      if (!enclosure) {
        throw new NotFoundException(
          `Enclosure với id ${enclosure_id} không tồn tại`
        );
      }

      // Validate news if provided (optional)
      let news: News | null = null;
      if (news_id) {
        news = await this.newsRepository.findOne({
          where: { id: news_id },
        });
        if (!news) {
          throw new NotFoundException(`News với id ${news_id} không tồn tại`);
        }
      }

      // Chuyển đổi start_date và end_date
      const startDate = dayjs(start_date).toDate();
      const endDate = dayjs(end_date).toDate();

      // Xác định status nếu không được cung cấp
      const finalStatus = status || this.determineStatus(startDate, endDate);

      const event = this.eventsRepository.create({
        ...eventData,
        start_date: startDate,
        end_date: endDate,
        status: finalStatus,
        enclosure,
        news,
      });

      const savedEvent = await this.eventsRepository.save(event);
      return {
        id: savedEvent.id,
        message: "Tạo event thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo event");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [events, total] = await this.eventsRepository
        .createQueryBuilder("event")
        .leftJoinAndSelect("event.enclosure", "enclosure")
        .leftJoinAndSelect("event.news", "news")
        .select([
          "event.id",
          "event.title",
          "event.description",
          "event.start_date",
          "event.end_date",
          "event.status",
          "event.created_at",
          "event.updated_at",
          "enclosure.id",
          "enclosure.name",
          "news.id",
          "news.title",
        ])
        .skip(skip)
        .take(limit)
        .orderBy("event.id", "DESC")
        .getManyAndCount();

      return {
        data: events,
        meta: {
          totalItems: total,
          itemCount: events.length,
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch events");
    }
  }

  async findOne(id: number) {
    const event = await this.eventsRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.enclosure", "enclosure")
      .leftJoinAndSelect("event.news", "news")
      .where("event.id = :id", { id })
      .getOne();

    if (!event) {
      throw new NotFoundException(`Event với id ${id} không tồn tại`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      const event = await this.eventsRepository.findOne({
        where: { id },
        relations: ["enclosure", "news"],
      });
      if (!event) {
        throw new NotFoundException(`Event với id ${id} không tồn tại`);
      }

      const {
        enclosure_id,
        news_id,
        start_date,
        end_date,
        status,
        ...updateData
      } = updateEventDto;

      // Validate enclosure if provided (required in schema)
      let enclosure: Enclosure = event.enclosure;
      if (enclosure_id) {
        const foundEnclosure: Enclosure | null =
          await this.enclosuresRepository.findOne({
            where: { id: enclosure_id },
          });
        if (!foundEnclosure) {
          throw new NotFoundException(
            `Enclosure với id ${enclosure_id} không tồn tại`
          );
        }
        enclosure = foundEnclosure;
      }

      // Validate news if provided (optional in schema)
      let news: News | null = event.news;
      if (news_id !== undefined) {
        if (news_id === null) {
          news = null;
        } else {
          const foundNews: News | null = await this.newsRepository.findOne({
            where: { id: news_id },
          });
          if (!foundNews) {
            throw new NotFoundException(`News với id ${news_id} không tồn tại`);
          }
          news = foundNews;
        }
      }

      // Xác định start_date và end_date để tính status
      const finalStartDate = start_date
        ? dayjs(start_date).toDate()
        : event.start_date;
      const finalEndDate = end_date ? dayjs(end_date).toDate() : event.end_date;

      // Xác định status nếu không được cung cấp
      const finalStatus =
        status || this.determineStatus(finalStartDate, finalEndDate);

      const updateEventData: Partial<Event> = {
        title: updateData.title ?? event.title,
        description: updateData.description ?? event.description,
        start_date: finalStartDate,
        end_date: finalEndDate,
        status: finalStatus,
        enclosure,
        news,
      };

      await this.eventsRepository.save({ ...event, ...updateEventData });
      const updatedEvent = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        event: updatedEvent,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật event");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.eventsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa event thất bại");
      }
      return {
        message: "Xóa event thành công",
        affected: result.affected as number,
      };
    } catch (e) {
      throw e;
    }
  }
}
