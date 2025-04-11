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
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private configService: ConfigService
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      const { title, content, file } = createNewsDto;

      // Construct the image URL if a file is uploaded
      let defaultImage: string | undefined;
      if (file) {
        const appUrl =
          this.configService.get<string>("APP_URL") || "http://localhost:3000";
        defaultImage = `${appUrl}/uploads/news/${file.filename}`;
      }

      const news = this.newsRepository.create({
        title,
        content,
        defaultImage,
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
        select: [
          "id",
          "title",
          "content",
          "defaultImage",
          "createdAt",
          "updatedAt",
        ],
      });

      return {
        data: news,
        meta: {
          totalItems: total,
          itemCount: news.length,
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
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
      select: [
        "id",
        "title",
        "content",
        "defaultImage",
        "createdAt",
        "updatedAt",
      ],
    });
    if (!news) {
      throw new NotFoundException(`News với id ${id} không tồn tại`);
    }
    return news;
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    try {
      const news = await this.findOne(id);

      let defaultImage = news.defaultImage;
      if (updateNewsDto.file) {
        const appUrl =
          this.configService.get<string>("APP_URL") || "http://localhost:3000";
        defaultImage = `${appUrl}/uploads/news/${updateNewsDto.file.filename}`;
      }

      const updateData: Partial<News> = {
        title: updateNewsDto.title ?? news.title,
        content: updateNewsDto.content ?? news.content,
        defaultImage,
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
