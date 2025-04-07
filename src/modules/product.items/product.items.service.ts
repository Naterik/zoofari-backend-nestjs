import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
import { ProductItems } from "./entities/product.item.entity";
import { CreateProductItemDto } from "./dto/create-product.item.dto";
import { UpdateProductItemDto } from "./dto/update-product.item.dto";
import { Product } from "../products/entities/product.entity";
import { PaginateQuery } from "nestjs-paginate";
import { ImagesService } from "../images/images.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ProductItemsService {
  constructor(
    @InjectRepository(ProductItems)
    private productItemsRepository: Repository<ProductItems>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private imagesService: ImagesService,
    private configService: ConfigService
  ) {}

  async create(
    createProductItemDto: CreateProductItemDto,
    files: Array<Express.Multer.File> = []
  ) {
    const queryRunner =
      this.productItemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, ...productItemData } = createProductItemDto;

      const product = await queryRunner.manager.findOne(Product, {
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product với id ${productId} không tồn tại`
        );
      }

      const productItem = queryRunner.manager.create(ProductItems, {
        ...productItemData,
        product,
      });

      const savedProductItem = await queryRunner.manager.save(productItem);

      if (files.length > 0) {
        const appUrl = this.configService.get<string>("APP_URL");
        for (const file of files) {
          const fileUrl = `${appUrl}/uploads/${file.filename}`;
          await this.imagesService.createForProductItem(
            savedProductItem.id,
            {
              url: fileUrl,
              description: file.originalname,
            },
            queryRunner
          );
        }
      }

      await queryRunner.commitTransaction();
      return {
        id: savedProductItem.id,
        message: "Tạo product item thành công",
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error("Error creating product item:", e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo product item");
    } finally {
      await queryRunner.release();
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
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
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
      .where("productItem.id = :id", { id })
      .getOne();

    if (!productItem) {
      throw new NotFoundException(`Product item với id ${id} không tồn tại`);
    }

    return productItem;
  }

  async update(id: number, updateProductItemDto: UpdateProductItemDto) {
    const queryRunner =
      this.productItemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productItem = await queryRunner.manager.findOne(ProductItems, {
        where: { id },
        relations: ["product"],
      });
      if (!productItem) {
        throw new NotFoundException(`Product item với id ${id} không tồn tại`);
      }

      const { productId, files, replaceImages, ...rest } = updateProductItemDto;
      const updateData: Partial<ProductItems> & { product?: Product } = {
        ...rest,
      };

      if (productId) {
        const product = await queryRunner.manager.findOne(Product, {
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

      await queryRunner.manager.save(ProductItems, {
        ...productItem,
        ...updateProductItemData,
      });

      if (files && files.length > 0) {
        if (replaceImages) {
          const existingImages = await this.imagesService.findByProductItemId(
            id,
            queryRunner
          );
          for (const image of existingImages) {
            await this.imagesService.remove(image.id, queryRunner);
          }
        }

        const appUrl = this.configService.get<string>("APP_URL");
        for (const file of files) {
          const fileUrl = `${appUrl}/uploads/${file.filename}`;
          await this.imagesService.createForProductItem(
            id,
            {
              url: fileUrl,
              description: file.originalname,
            },
            queryRunner
          );
        }
      }

      await queryRunner.commitTransaction();
      const updatedProductItem = await this.findOne(id);
      return {
        message: "Cập nhật thành công",
        productItem: updatedProductItem,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating product item:", e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật product item");
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner =
      this.productItemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(ProductItems, id);
      if (result.affected === 0)
        throw new BadRequestException("Xóa product item thất bại");
      await queryRunner.commitTransaction();
      return {
        message: "Xóa product item thành công",
        affected: result.affected,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error("Error deleting product item:", e);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductItemImages(productItemId: number) {
    await this.findOne(productItemId);
    return await this.imagesService.findByProductItemId(productItemId);
  }

  async addImageToProductItem(
    productItemId: number,
    files: Array<Express.Multer.File>
  ) {
    const queryRunner =
      this.productItemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.findOne(productItemId);
      const appUrl = this.configService.get<string>("APP_URL");
      const imagePromises = files.map((file) => {
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        return this.imagesService.createForProductItem(
          productItemId,
          {
            url: fileUrl,
            description: file.originalname,
          },
          queryRunner
        );
      });
      await Promise.all(imagePromises);
      await queryRunner.commitTransaction();
      return {
        message: "Images added to product item successfully",
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async removeProductItemImage(productItemId: number, imageId: number) {
    const queryRunner =
      this.productItemsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.findOne(productItemId);
      const images = await this.imagesService.findByProductItemId(
        productItemId,
        queryRunner
      );
      const imageToRemove = images.find((img) => img.id === imageId);
      if (!imageToRemove) {
        throw new NotFoundException(
          `Image with id ${imageId} not found for product item ${productItemId}`
        );
      }
      await this.imagesService.remove(imageId, queryRunner);
      await queryRunner.commitTransaction();
      return {
        message: "Image removed from product item successfully",
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
