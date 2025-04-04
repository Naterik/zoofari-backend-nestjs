export class CreateTicketDto {
  type: "Adult" | "Child" | "VIP";
  price: number;
  description?: string;
}
