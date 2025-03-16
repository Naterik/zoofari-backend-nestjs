import { TicketSale } from "src/modules/ticket.sales/entities/ticket.sale.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Image } from "src/modules/images/entities/image.entity";
@Entity("tickets")
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: ["Adult", "Child", "VIP"],
  })
  type: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => TicketSale, (ticketSale) => ticketSale.ticket)
  ticketSales: TicketSale[];

  @OneToMany(() => Image, (image) => image.ticket)
  images: Image[];
}
