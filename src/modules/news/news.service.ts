import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { News } from "./entities/news.entity";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { PaginateQuery } from "nestjs-paginate";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      const { title, content } = createNewsDto;

      const news = this.newsRepository.create({
        title,
        content,
      });

      const savedNews = await this.newsRepository.save(news);
      return {
        id: savedNews.id,
        message: "Tạo news thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo news");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [news, total] = await this.newsRepository.findAndCount({
        skip,
        take: limit,
        order: { id: "DESC" },
        select: ["id", "title", "content", "createdAt", "updatedAt"],
      });

      return {
        data: news,
        meta: {
          totalItems: total,
          itemCount: news.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch news");
    }
  }

  async findOne(id: number) {
    const news = await this.newsRepository.findOne({
      where: { id },
    });
    if (!news) {
      throw new NotFoundException(`News với id ${id} không tồn tại`);
    }
    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    try {
      const news = await this.findOne(id);

      const updateData: Partial<News> = {
        title: updateNewsDto.title ?? news.title,
        content: updateNewsDto.content ?? news.content,
      };

      await this.newsRepository.save({ ...news, ...updateData });
      const updatedNews = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        news: updatedNews,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật news");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.newsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa news thất bại");
      }
      return {
        message: "Xóa news thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }
}
