import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductItems } from "./entities/product.item.entity";
import { CreateProductItemDto } from "./dto/create-product.item.dto";
import { UpdateProductItemDto } from "./dto/update-product.item.dto";
import { Product } from "../products/entities/product.entity";
import { PaginateQuery } from "nestjs-paginate";
import { ImagesService } from "../images/images.service";
import { ConfigService } from "@nestjs/config";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";

@Injectable()
export class ProductItemsService {
  constructor(
    @InjectRepository(ProductItems)
    private productItemsRepository: Repository<ProductItems>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductItemOptions)
    private optionsRepository: Repository<ProductItemOptions>,
    private imagesService: ImagesService,
    private configService: ConfigService
  ) {}

  async create(createProductItemDto: CreateProductItemDto) {
    try {
      const { productId, file, ...productItemData } = createProductItemDto;

      const product = await this.productsRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product với id ${productId} không tồn tại`
        );
      }

      const productItem = this.productItemsRepository.create({
        ...productItemData,
        product,
      });

      const savedProductItem =
        await this.productItemsRepository.save(productItem);

      // Xử lý upload ảnh nếu có file
      if (file) {
        const appUrl = this.configService.get<string>("APP_URL");
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        await this.imagesService.createForProductItem(savedProductItem.id, {
          url: fileUrl,
          description: file.originalname,
        });
      }

      return {
        id: savedProductItem.id,
        message: "Tạo product item thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo product item");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [productItems, total] = await this.productItemsRepository
        .createQueryBuilder("productItem")
        .leftJoinAndSelect("productItem.product", "product")
        .leftJoinAndSelect("productItem.images", "images")
        .select([
          "productItem.id",
          "productItem.title",
          "productItem.basePrice",
          "productItem.description",
          "productItem.code",
          "productItem.stock",
          "product.id",
          "product.name",
          "images.id",
          "images.url",
          "images.description",
        ])
        .skip(skip)
        .take(limit)
        .orderBy("productItem.id", "DESC")
        .getManyAndCount();

      return {
        data: productItems,
        meta: {
          totalItems: total,
          itemCount: productItems.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch product items");
    }
  }

  async findOne(id: number) {
    const productItem = await this.productItemsRepository
      .createQueryBuilder("productItem")
      .leftJoinAndSelect("productItem.product", "product")
      .leftJoinAndSelect("productItem.images", "images")
      .leftJoinAndSelect("productItem.productItemOptions", "productItemOptions")
      .leftJoinAndSelect("productItem.orderDetails", "orderDetails")
      .where("productItem.id = :id", { id })
      .getOne();

    if (!productItem) {
      throw new NotFoundException(`Product item với id ${id} không tồn tại`);
    }

    return productItem;
  }

  async getOptions(productItemId: number): Promise<ProductItemOptions[]> {
    const item = await this.findOne(productItemId);
    return item.productItemOptions;
  }

  async update(id: number, updateProductItemDto: UpdateProductItemDto) {
    try {
      const productItem = await this.productItemsRepository.findOne({
        where: { id },
        relations: ["product"],
      });
      if (!productItem) {
        throw new NotFoundException(`Product item với id ${id} không tồn tại`);
      }

      const { productId, file, replaceImages, ...rest } = updateProductItemDto;
      const updateData: Partial<ProductItems> & {
        product?: Product;
      } = { ...rest };

      if (productId) {
        const product = await this.productsRepository.findOne({
          where: { id: productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Product với id ${productId} không tồn tại`
          );
        }
        updateData.product = product;
      }

      const updateProductItemData: Partial<ProductItems> = {
        title: updateData.title ?? productItem.title,
        basePrice: updateData.basePrice ?? productItem.basePrice,
        description: updateData.description ?? productItem.description,
        code: updateData.code ?? productItem.code,
        stock: updateData.stock ?? productItem.stock,
        product: updateData.product ?? productItem.product,
      };

      await this.productItemsRepository.save({
        ...productItem,
        ...updateProductItemData,
      });

      // Xử lý upload ảnh nếu có file
      if (file) {
        // Nếu replaceImages = true, xóa ảnh cũ trước khi thêm ảnh mới
        if (replaceImages) {
          const existingImages =
            await this.imagesService.findByProductItemId(id);
          for (const image of existingImages) {
            await this.imagesService.remove(image.id);
          }
        }

        // Thêm ảnh mới
        const appUrl = this.configService.get<string>("APP_URL");
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        await this.imagesService.createForProductItem(id, {
          url: fileUrl,
          description: file.originalname,
        });
      }

      const updatedProductItem = await this.findOne(id);
      return {
        message: "Cập nhật thành công",
        productItem: updatedProductItem,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật product item");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.productItemsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa product item thất bại");
      }
      // Images will be automatically deleted due to ON DELETE CASCADE in the images table
      return {
        message: "Xóa product item thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }

  async getProductItemImages(productItemId: number) {
    await this.findOne(productItemId);
    return await this.imagesService.findByProductItemId(productItemId);
  }

  async addImageToProductItem(
    productItemId: number,
    file: Express.Multer.File
  ) {
    await this.findOne(productItemId);
    const appUrl = this.configService.get<string>("APP_URL");
    const fileUrl = `${appUrl}/uploads/${file.filename}`;
    const image = await this.imagesService.createForProductItem(productItemId, {
      url: fileUrl,
      description: file.originalname,
    });
    return { message: "Image added to product item successfully", image };
  }

  async removeProductItemImage(productItemId: number, imageId: number) {
    await this.findOne(productItemId);
    const images = await this.imagesService.findByProductItemId(productItemId);
    const imageToRemove = images.find((img) => img.id === imageId);
    if (!imageToRemove) {
      throw new NotFoundException(
        `Image with id ${imageId} not found for product item ${productItemId}`
      );
    }
    await this.imagesService.remove(imageId);
    return { message: "Image removed from product item successfully" };
  }
}
