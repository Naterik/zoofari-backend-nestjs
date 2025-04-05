import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImagesService } from "./images.service";
import { ConfigService } from "@nestjs/config";
import { diskStorage } from "multer";
import { extname } from "path";

@Controller("images")
export class ImagesController {
  constructor(
    private imagesService: ImagesService,
    private configService: ConfigService
  ) {}

  @Post("upload/animal/:animalId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async uploadImageForAnimal(
    @Param("animalId") animalId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    const appUrl = this.configService.get<string>("APP_URL");
    const fileUrl = `${appUrl}/uploads/${file.filename}`;
    return this.imagesService.createForAnimal(animalId, {
      url: fileUrl,
      description: file.originalname,
    });
  }

  @Post("upload/product-item/:productItemId")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    })
  )
  async uploadImageForProductItem(
    @Param("productItemId") productItemId: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    const appUrl = this.configService.get<string>("APP_URL");
    const fileUrl = `${appUrl}/uploads/${file.filename}`;
    return this.imagesService.createForProductItem(productItemId, {
      url: fileUrl,
      description: file.originalname,
    });
  }
}
