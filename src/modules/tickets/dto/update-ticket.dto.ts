export class UpdateTicketDto {
  type?: "Adult" | "Child" | "VIP";
  price?: number;
  description?: string;
}
