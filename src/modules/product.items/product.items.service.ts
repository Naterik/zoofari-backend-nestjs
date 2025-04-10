import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner, In } from "typeorm";
import { ProductItems } from "./entities/product.item.entity";
import { CreateProductItemDto } from "./dto/create-product.item.dto";
import { UpdateProductItemDto } from "./dto/update-product.item.dto";
import { Product } from "../products/entities/product.entity";
import { ImagesService } from "../images/images.service";
import { ConfigService } from "@nestjs/config";
import { SortedDto } from "./dto/sorted.dto";
import { ByProductDto } from "./dto/by-product.dto";
import { ByPriceRangeDto } from "./dto/by-price-range.dto";
import { SearchDto } from "./dto/search.dto";

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

  private createBaseQuery() {
    return this.productItemsRepository
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
        "productItem.createdAt",
        "productItem.updatedAt",
        "product.id",
        "product.name",
        "images.id",
        "images.url",
        "images.description",
      ]);
  }

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

      if (!productItemData.title) {
        throw new BadRequestException("Tiêu đề không được để trống");
      }

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
      throw new BadRequestException(
        `Có lỗi xảy ra khi tạo product item: ${e.message}`
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<any> {
    try {
      const queryBuilder = this.createBaseQuery();
      queryBuilder.orderBy("productItem.id", "DESC");

      const [productItems, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
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

  async findAllSorted({ page, limit }: SortedDto): Promise<any> {
    try {
      const queryBuilder = this.createBaseQuery();
      queryBuilder.orderBy("productItem.updatedAt", "DESC");

      const [productItems, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
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
      console.error("Error in findAllSorted:", error);
      throw new BadRequestException("Failed to fetch sorted product items");
    }
  }

  async findByProduct({ page, limit, productIds }: ByProductDto): Promise<any> {
    try {
      const products = await this.productsRepository.find({
        where: { id: In(productIds) },
      });
      if (!products || products.length === 0) {
        throw new NotFoundException(
          `Không tìm thấy sản phẩm với các ID: ${productIds.join(", ")}`
        );
      }

      const queryBuilder = this.createBaseQuery();
      queryBuilder.where("product.id IN (:...productIds)", { productIds });

      const [productItems, total] = await queryBuilder
        .skip((page - 1) * limit)
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
      console.error("Error in findByProduct:", error);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException("Failed to fetch product items by product");
    }
  }

  async findByPriceRange({
    page,
    limit,
    minPrice,
    maxPrice,
  }: ByPriceRangeDto): Promise<any> {
    try {
      if (minPrice > maxPrice) {
        throw new BadRequestException("minPrice không thể lớn hơn maxPrice");
      }

      const queryBuilder = this.createBaseQuery();
      queryBuilder
        .where("productItem.basePrice >= :minPrice", { minPrice })
        .andWhere("productItem.basePrice <= :maxPrice", { maxPrice });

      const [productItems, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("productItem.basePrice", "ASC")
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
      console.error("Error in findByPriceRange:", error);
      throw new BadRequestException(
        "Failed to fetch product items by price range"
      );
    }
  }

  async search({ page, limit, title }: SearchDto): Promise<any> {
    try {
      const queryBuilder = this.createBaseQuery();
      queryBuilder.where("productItem.title LIKE :title", {
        title: `%${title}%`,
      });

      const [productItems, total] = await queryBuilder
        .skip((page - 1) * limit)
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
      console.error("Error in search:", error);
      throw new BadRequestException("Failed to search product items");
    }
  }

  async findOne(id: number) {
    const productItem = await this.createBaseQuery()
      .where("productItem.id = :id", { id })
      .getOne();

    if (!productItem) {
      throw new NotFoundException(`Product item với id ${id} không tồn tại`);
    }

    return productItem;
  }

  async findOneWithDetails(id: number) {
    return this.findOne(id);
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

      const { productId, files, ...rest } = updateProductItemDto;
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
      if (result.affected === 0) {
        throw new BadRequestException("Xóa product item thất bại");
      }
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
      return { message: "Image removed from product item successfully" };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
