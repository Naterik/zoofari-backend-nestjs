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
    const createAnimalDto = new CreateAnimalDto();
    Object.assign(createAnimalDto, {
      name: body.name,
      species_id: body.species_id,
      enclosure_id: body.enclosure_id,
      birth_date: body.birth_date,
      gender: body.gender,
      health_status: body.health_status,
      description: body.description,
      appearance: body.appearance,
      behavior: body.behavior,
      files,
    });

    return this.animalsService.create(createAnimalDto, files);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.animalsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.animalsService.findOne(+id);
  }

  @Get(":id/details")
  findOneWithDetails(@Param("id") id: string) {
    return this.animalsService.findOneWithDetails(+id);
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
    @Param("id") id: string,
    @Body() body: any, // Nhận FormData giống như create
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    // Ánh xạ thủ công từ FormData vào UpdateAnimalDto
    const updateAnimalDto: UpdateAnimalDto = {
      name: body.name,
      species_id: body.species_id,
      enclosure_id: body.enclosure_id,
      birth_date: body.birth_date,
      gender: body.gender,
      health_status: body.health_status,
      description: body.description,
      appearance: body.appearance,
      behavior: body.behavior,
      files: files || [],
    };

    return this.animalsService.update(+id, updateAnimalDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.animalsService.remove(+id);
  }

  @Delete(":animalId/images/:imageId")
  async removeImage(
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("imageId", ParseIntPipe) imageId: number
  ) {
    return this.animalsService.removeAnimalImage(animalId, imageId);
  }
}
