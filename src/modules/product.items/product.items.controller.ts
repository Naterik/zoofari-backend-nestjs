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
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ProductItemsService } from "./product.items.service";
import { CreateProductItemDto } from "./dto/create-product.item.dto";
import { UpdateProductItemDto } from "./dto/update-product.item.dto";
import { PaginateQuery } from "nestjs-paginate";

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
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed"),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async create(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const createProductItemDto: CreateProductItemDto = {
      title: body.title,
      basePrice: body.basePrice,
      description: body.description,
      code: body.code,
      stock: body.stock,
      productId: body.productId,
      files,
    };
    return this.productItemsService.create(createProductItemDto, files);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.productItemsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productItemsService.findOne(id);
  }

  @Get(":id/details")
  findOneWithDetails(@Param("id", ParseIntPipe) id: number) {
    return this.productItemsService.findOneWithDetails(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed"),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const updateProductItemDto: UpdateProductItemDto = {
      title: body.title,
      basePrice: body.basePrice,
      description: body.description,
      code: body.code,
      stock: body.stock,
      productId: body.productId,
      files: files || [],
    };
    return this.productItemsService.update(id, updateProductItemDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productItemsService.remove(id);
  }

  @Delete(":productItemId/images/:imageId")
  async removeImage(
    @Param("productItemId", ParseIntPipe) productItemId: number,
    @Param("imageId", ParseIntPipe) imageId: number
  ) {
    return this.productItemsService.removeProductItemImage(
      productItemId,
      imageId
    );
  }
}
