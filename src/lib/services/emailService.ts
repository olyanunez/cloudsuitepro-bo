import { apiPost } from './apiService';

export interface SendInvoiceEmailRequest {
  invoiceId: number;
  email?: string; // Optional, if not provided backend will use customer email
}

export interface SendInvoiceEmailResponse {
  success: boolean;
  message: string;
  recipientEmail: string;
}

export class EmailService {
  /**
   * Send invoice by email
   * @param invoiceId - The ID of the invoice to send
   * @param email - Optional email address, if not provided will use customer's email
   */
  static async sendInvoiceEmail(
    invoiceId: number,
    email?: string,
  ): Promise<SendInvoiceEmailResponse> {
    return apiPost<SendInvoiceEmailResponse>('/email/send-invoice', {
      invoiceId,
      email,
    });
  }
}
