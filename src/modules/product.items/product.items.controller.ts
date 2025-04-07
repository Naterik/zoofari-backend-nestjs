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
  UsePipes,
  ValidationPipe,
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createProductItemDto: CreateProductItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.productItemsService.create(createProductItemDto, files);
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param("id") id: string,
    @Body() updateProductItemDto: UpdateProductItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    updateProductItemDto.files = files || [];
    return this.productItemsService.update(+id, updateProductItemDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productItemsService.remove(+id);
  }

  // @Get(":id/images")
  // getProductItemImages(@Param("id") id: string) {
  //   return this.productItemsService.getProductItemImages(+id);
  // }

  // @Post(":id/images")
  // @UseInterceptors(FilesInterceptor("files", { storage }))
  // addImageToProductItem(
  //   @Param("id") id: string,
  //   @UploadedFiles() files: Array<Express.Multer.File>
  // ) {
  //   return this.productItemsService.addImageToProductItem(+id, files);
  // }

  // @Delete(":id/images/:imageId")
  // removeProductItemImage(
  //   @Param("id") id: string,
  //   @Param("imageId") imageId: string
  // ) {
  //   return this.productItemsService.removeProductItemImage(+id, +imageId);
  // }
}
