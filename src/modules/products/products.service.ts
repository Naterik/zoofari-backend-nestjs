import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginateQuery } from "nestjs-paginate";
import { Animal } from "../animals/entities/animal.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductItems)
    private productItemsRepository: Repository<ProductItems>,
    @InjectRepository(Animal)
    private animalsRepository: Repository<Animal>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { animal_id, ...productData } = createProductDto;

      // Validate animal
      const animal = await this.animalsRepository.findOne({
        where: { id: animal_id },
      });
      if (!animal) {
        throw new NotFoundException(`Animal với id ${animal_id} không tồn tại`);
      }

      const product = this.productsRepository.create({
        ...productData,
        animal,
      });

      const savedProduct = await this.productsRepository.save(product);
      return {
        id: savedProduct.id,
        message: "Tạo product thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo product");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [products, total] = await this.productsRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.animal", "animal")
        .select([
          "product.id",
          "product.name",
          "product.description",
          "product.stock",
          "product.status",
          "product.created_at",
          "product.updated_at",
          "animal.id",
          "animal.name",
        ])
        .skip(skip)
        .take(limit)
        .orderBy("product.id", "DESC")
        .getManyAndCount();

      return {
        data: products,
        meta: {
          totalItems: total,
          itemCount: products.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch products");
    }
  }

  async findOne(id: number) {
    const product = await this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.animal", "animal")
      .leftJoinAndSelect("product.orderDetails", "orderDetails")
      .leftJoinAndSelect("product.productItems", "productItems")
      .where("product.id = :id", { id })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Product với id ${id} không tồn tại`);
    }
    return product;
  }
  async getVariants(productId: number): Promise<ProductItems[]> {
    const product = await this.findOne(productId);
    return product.productItems;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productsRepository.findOne({
        where: { id },
        relations: ["animal"],
      });
      if (!product) {
        throw new NotFoundException(`Product với id ${id} không tồn tại`);
      }

      const { animal_id, ...updateData } = updateProductDto;

      // Prepare the update data without including animal directly
      const updateProductData: Partial<Product> = {
        name: updateData.name ?? product.name,
        description: updateData.description ?? product.description,
        stock: updateData.stock ?? product.stock,
        status: updateData.status ?? product.status,
      };

      // Update animal if provided
      if (animal_id) {
        const animal = await this.animalsRepository.findOne({
          where: { id: animal_id },
        });
        if (!animal) {
          throw new NotFoundException(
            `Animal với id ${animal_id} không tồn tại`
          );
        }
        updateProductData.animal = animal;
      } else {
        updateProductData.animal = product.animal;
      }

      await this.productsRepository.save({ ...product, ...updateProductData });
      const updatedProduct = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        product: updatedProduct,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật product");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.productsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa product thất bại");
      }
      return {
        message: "Xóa product thành công",
        affected: result.affected as number,
      };
    } catch (e) {
      throw e;
    }
  }
}
