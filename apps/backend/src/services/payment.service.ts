import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentService {
  async createPayment(data: {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    splitNumber?: number;
    transactionId?: string;
  }) {
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        status: 'PENDING',
        splitNumber: data.splitNumber,
        transactionId: data.transactionId,
      },
    });

    return payment;
  }

  async confirmPayment(paymentId: string) {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    // Update order status if fully paid
    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { payments: true },
    });

    if (order) {
      const totalPaid = order.payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const orderTotal = await this.calculateOrderTotal(order.id);

      if (totalPaid >= orderTotal) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }
    }

    return payment;
  }

  async processRefund(paymentId: string, _amount?: number) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status to refunded
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    return { success: true };
  }

  async splitBill(orderId: string, splits: Array<{ amount: number }>) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } } },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const total = await this.calculateOrderTotal(orderId);
    const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);

    if (Math.abs(splitTotal - total) > 0.01) {
      throw new Error('Split amounts do not match order total');
    }

    const payments = await Promise.all(
      splits.map((split, index) =>
        this.createPayment({
          orderId,
          amount: split.amount,
          method: 'CREDIT_CARD',
          splitNumber: index + 1,
        })
      )
    );

    return payments;
  }

  async calculateOrderTotal(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const subtotal = order.items.reduce((sum, item) => {
      return sum + Number(item.menuItem.price) * item.quantity;
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    return subtotal + tax;
  }

  async getPaymentsByOrder(orderId: string) {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
