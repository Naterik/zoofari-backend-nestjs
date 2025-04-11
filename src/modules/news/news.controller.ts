import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { NewsService } from "./news.service";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { PaginateQuery } from "nestjs-paginate";
import { News } from "./entities/news.entity";
import { validate } from "class-validator";

// Configure storage for uploaded files
const storage = diskStorage({
  destination: "./uploads/news", // Store files in uploads/news directory
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException(
              "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)"
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async create(
    @Body() body: any, // Use `any` to handle form-data
    @UploadedFile() file: Express.Multer.File
  ) {
    // Manually map form-data to CreateNewsDto
    const createNewsDto = new CreateNewsDto();
    createNewsDto.title = body.title;
    createNewsDto.content = body.content;
    createNewsDto.file = file;

    // Validate the DTO
    const errors = await validate(createNewsDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.newsService.create(createNewsDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.newsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.newsService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException(
              "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)"
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async update(
    @Param("id") id: string,
    @Body() body: any, // Use `any` to handle form-data
    @UploadedFile() file: Express.Multer.File
  ) {
    // Manually map form-data to UpdateNewsDto
    const updateNewsDto = new UpdateNewsDto();
    updateNewsDto.title = body.title;
    updateNewsDto.content = body.content;
    updateNewsDto.file = file;

    const errors = await validate(updateNewsDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.newsService.remove(+id);
  }
}
