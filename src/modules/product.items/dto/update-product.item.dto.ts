import { PartialType } from "@nestjs/mapped-types";
import { CreateProductItemDto } from "./create-product.item.dto";
import { IsOptional } from "class-validator";

export class UpdateProductItemDto extends PartialType(CreateProductItemDto) {
  @IsOptional()
  files: Array<Express.Multer.File>;
}
