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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AnimalsService } from "./animals.service";
import { CreateAnimalDto } from "./dto/create-animal.dto";
import { UpdateAnimalDto } from "./dto/update-animal.dto";
import { PaginateQuery } from "nestjs-paginate";

const storage = diskStorage({
  destination: "./uploads",
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller("animals")
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { storage }))
  async create(
    @Body() createAnimalDto: CreateAnimalDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      createAnimalDto.file = file;
    }
    return this.animalsService.create(createAnimalDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.animalsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.animalsService.findOne(+id);
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file", { storage }))
  async update(
    @Param("id") id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      updateAnimalDto.file = file;
    }
    return this.animalsService.update(+id, updateAnimalDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.animalsService.remove(+id);
  }

  @Get(":id/images")
  getAnimalImages(@Param("id") id: string) {
    return this.animalsService.getAnimalImages(+id);
  }

  @Post(":id/images")
  @UseInterceptors(FileInterceptor("file", { storage }))
  addImageToAnimal(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.animalsService.addImageToAnimal(+id, file);
  }

  @Delete(":id/images/:imageId")
  removeAnimalImage(
    @Param("id") id: string,
    @Param("imageId") imageId: string
  ) {
    return this.animalsService.removeAnimalImage(+id, +imageId);
  }
}
