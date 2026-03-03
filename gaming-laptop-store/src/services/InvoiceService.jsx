import api from "./Api";
import urls from "./Urls";

export async function getInvoices() {
  const response = await api.get(urls.invoicesList);
  return response.data;
}

export async function createInvoice(data) {
  const response = await api.post(urls.invoicesCreate, data);
  return response.data;
}

export async function getInvoiceDetail(id) {
  const response = await api.get(urls.invoiceDetail(id));
  return response.data;
}

export async function updateInvoice(id, data) {
  const response = await api.patch(urls.invoiceUpdate(id), data);
  return response.data;
}

export async function deleteInvoice(id) {
  const response = await api.delete(urls.invoiceDelete(id));
  return response.data;
}

export async function downloadInvoice(id, billId) {
  const response = await api.get(urls.invoiceDownload(id), {
    responseType: "blob",
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `factura_${billId}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function resendInvoiceEmail(id) {
  const response = await api.post(urls.invoiceResendEmail(id));
  return response.data;
}
