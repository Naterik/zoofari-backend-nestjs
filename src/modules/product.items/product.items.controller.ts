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
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { PaginateQuery } from "nestjs-paginate";
import { ProductItemsService } from "./product.items.service";
import { CreateProductItemDto } from "./dto/create-product.item.dto";
import { UpdateProductItemDto } from "./dto/update-product.item.dto";

const storage = diskStorage({
  destination: "./uploads",
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller("product-items")
export class ProductItemsController {
  constructor(private readonly productItemsService: ProductItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { storage }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createProductItemDto: CreateProductItemDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      createProductItemDto.file = file;
    }
    return this.productItemsService.create(createProductItemDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.productItemsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productItemsService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file", { storage }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param("id") id: string,
    @Body() updateProductItemDto: UpdateProductItemDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      updateProductItemDto.file = file;
    }
    return this.productItemsService.update(+id, updateProductItemDto);
  }

  @Get(":id/options")
  getOptions(@Param("id") id: string) {
    return this.productItemsService.getOptions(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productItemsService.remove(+id);
  }
}
