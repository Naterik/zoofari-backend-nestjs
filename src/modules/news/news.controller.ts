import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { NewsService } from "./news.service";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { PaginateQuery } from "nestjs-paginate";
import { News } from "./entities/news.entity";

@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
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
  update(@Param("id") id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.newsService.remove(+id);
  }
}
