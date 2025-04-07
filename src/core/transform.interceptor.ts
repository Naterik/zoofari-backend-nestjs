import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RESPONSE_MESSAGE } from "src/decorator/customized"; // Đảm bảo đường dẫn này chính xác

// Interface cho cấu trúc response cuối cùng
// Lưu ý: Thêm thuộc tính 'meta' để xử lý trường hợp phân trang
export interface StandardResponse<T> {
  statusCode: number;
  message?: string;
  data?: T | T[]; // data có thể là một đối tượng hoặc một mảng
  meta?: any; // Thêm meta cho trường hợp phân trang
}

// (Tùy chọn nhưng nên có) Interface để định nghĩa cấu trúc kết quả phân trang
// mà controller/service của bạn trả về
interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number | string; // Cho phép cả string như trong ví dụ của bạn
    totalPages: number;
    currentPage: number | string; // Cho phép cả string
    // Thêm các thuộc tính khác của meta nếu có
  };
}

@Injectable() // Sử dụng 'any' hoặc một kiểu Union cụ thể hơn nếu có thể
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<any>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<StandardResponse<any>> {
    return next.handle().pipe(
      map((responseData) => {
        // Đổi tên 'data' thành 'responseData' để rõ ràng hơn
        const httpResponse = context.switchToHttp().getResponse();
        const statusCode = httpResponse.statusCode;
        const message =
          this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
          "";

        // Kiểm tra xem responseData có phải là cấu trúc phân trang đặc biệt không
        // (có cả 'data' là mảng và 'meta' là object)
        if (
          responseData &&
          typeof responseData === "object" &&
          Object.prototype.hasOwnProperty.call(responseData, "data") && // Kiểm tra an toàn hơn
          Object.prototype.hasOwnProperty.call(responseData, "meta") &&
          Array.isArray(responseData.data) && // data phải là mảng
          typeof responseData.meta === "object" && // meta phải là object
          responseData.meta !== null // meta không được là null
          // Bạn có thể thêm các kiểm tra chặt chẽ hơn cho các thuộc tính bên trong 'meta' nếu cần
          // Ví dụ: Object.prototype.hasOwnProperty.call(responseData.meta, 'totalItems')
        ) {
          // Nếu đúng là cấu trúc phân trang, lấy data và meta ra ngoài
          const paginatedData = responseData as PaginatedResult<any>; // Ép kiểu để truy cập thuộc tính

          return {
            statusCode: statusCode,
            message: message,
            data: paginatedData.data,
            meta: paginatedData.meta,
          };
        } else {
          // Nếu không phải cấu trúc phân trang (ví dụ: login response, get single item,...)
          // thì bọc toàn bộ responseData vào thuộc tính 'data' như cũ
          return {
            statusCode: statusCode,
            message: message,
            data: responseData, // Bọc toàn bộ kết quả vào 'data'
          };
        }
      })
    );
  }
}
