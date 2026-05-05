const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const urls = {
  login: `${BASE_URL}/user/login/`,        
  refresh: `${BASE_URL}/user/token/refresh/`,
  logout: `${BASE_URL}/user/logout/`,    

  usersList: `${BASE_URL}/user/list/`,
  usersRegister: `${BASE_URL}/user/register/`,
  userUpdate: `${BASE_URL}/user/update/`,
  userActivate: `${BASE_URL}/user/activate/`,
  userDeactivate: `${BASE_URL}/user/deactivate/`,

  brandsList: `${BASE_URL}/products/brands/list/`,
  brandsCreate: `${BASE_URL}/products/brands/create/`,
  brandUpdate: `${BASE_URL}/products/brands/update/`,
  brandActivate: `${BASE_URL}/products/brands/activate/`,
  brandDeactivate: `${BASE_URL}/products/brands/deactivate/`,

  // PRODUCT TYPES
  productTypesList: `${BASE_URL}/products/product-types/list/`,
  productTypesCreate: `${BASE_URL}/products/product-types/create/`,
  productTypesUpdate: `${BASE_URL}/products/product-types/update/`,
  productTypesActivate: `${BASE_URL}/products/product-types/activate/`,
  productTypesDeactivate: `${BASE_URL}/products/product-types/deactivate/`,
  productTypesDetail: (id) => `${BASE_URL}/products/product-types/${id}/detail/`,

  // PRODUCT FIELDS
  productFieldsList: `${BASE_URL}/products/product-fields/list/`,
  productFieldsCreate: `${BASE_URL}/products/product-fields/create/`,
  productFieldsUpdate: `${BASE_URL}/products/product-fields/update/`,
  productFieldsActivate: `${BASE_URL}/products/product-fields/activate/`,
  productFieldsDeactivate: `${BASE_URL}/products/product-fields/deactivate/`,

  // SUPPLIERS
  suppliersList: `${BASE_URL}/products/suppliers/list/`,
  suppliersCreate: `${BASE_URL}/products/suppliers/create/`,
  suppliersUpdate: `${BASE_URL}/products/suppliers/update/`,
  suppliersActivate: `${BASE_URL}/products/suppliers/activate/`,
  suppliersDeactivate: `${BASE_URL}/products/suppliers/deactivate/`,

  // BAJO PEDIDO (ON-DEMAND SOURCING)
  bajoPedidoList: `${BASE_URL}/products/variantes/list/`,
  bajoPedidoCreate: `${BASE_URL}/products/variantes/create/`,
  bajoPedidoUpdate: (id) => `${BASE_URL}/products/variantes/update/${id}/`,
  bajoPedidoActivate: (id) => `${BASE_URL}/products/variantes/activate/${id}/`,
  bajoPedidoDeactivate: (id) => `${BASE_URL}/products/variantes/deactivate/${id}/`,
  bajoPedidoDetail: (id) => `${BASE_URL}/products/variantes/${id}/detail/`,

  // DESCUENTOS
  descuentosActivate: (id) => `${BASE_URL}/products/descuentos/activate/${id}/`,
  descuentosDeactivate: (id) => `${BASE_URL}/products/descuentos/deactivate/${id}/`,
  descuentosDelete: (id) => `${BASE_URL}/products/descuentos/delete/${id}/`,

  // PRODUCTOS (new domain model)
  productosList: `${BASE_URL}/products/productos/list/`,
  productosCreate: `${BASE_URL}/products/productos/create/`,
  productosUpdate: (id) => `${BASE_URL}/products/productos/update/${id}/`,
  productosActivate: (id) => `${BASE_URL}/products/productos/activate/${id}/`,
  productosDeactivate: (id) => `${BASE_URL}/products/productos/deactivate/${id}/`,
  productosDetail: (id) => `${BASE_URL}/products/productos/${id}/detail/`,

  // UNIDADES DE PRODUCTO
  unidadesList: `${BASE_URL}/products/unidades/list/`,
  unidadesCreate: `${BASE_URL}/products/unidades/create/`,
  unidadesUpdate: (id) => `${BASE_URL}/products/unidades/update/${id}/`,
  unidadesActivate: (id) => `${BASE_URL}/products/unidades/activate/${id}/`,
  unidadesDeactivate: (id) => `${BASE_URL}/products/unidades/deactivate/${id}/`,
  unidadesDetail: (id) => `${BASE_URL}/products/unidades/${id}/detail/`,

  // REPARACIONES (damaged equipment pipeline)
  reparacionesList: `${BASE_URL}/products/reparaciones/list/`,
  reparacionesReportarDano: (id) => `${BASE_URL}/products/unidades/${id}/reportar-dano/`,
  reparacionesIniciar: (id) => `${BASE_URL}/products/unidades/${id}/iniciar-reparacion/`,
  reparacionesCompletar: (id) => `${BASE_URL}/products/unidades/${id}/completar-reparacion/`,

  // MÉTODO ALIADO
  metodoAliadoList: `${BASE_URL}/products/metodo-aliado/list/`,
  metodoAliadoMarcarEnviada: (id) => `${BASE_URL}/products/unidades/${id}/metodo-aliado/marcar-enviada/`,
  metodoAliadoMarcarEntregada: (id) => `${BASE_URL}/products/unidades/${id}/metodo-aliado/marcar-entregada/`,
  metodoAliadoCancelar: (id) => `${BASE_URL}/products/unidades/${id}/metodo-aliado/cancelar/`,

  // DEPARTAMENTOS Y CIUDADES
  departamentosList: `${BASE_URL}/sales/departamentos/list/`,
  ciudadesList: `${BASE_URL}/sales/ciudades/list/`,

  // CLIENTES
  clientesList: `${BASE_URL}/sales/clientes/list/`,
  clientesCreate: `${BASE_URL}/sales/clientes/create/`,
  clientesUpdate: (id) => `${BASE_URL}/sales/clientes/update/${id}/`,
  clientesActivate: (id) => `${BASE_URL}/sales/clientes/activate/${id}/`,
  clientesDeactivate: (id) => `${BASE_URL}/sales/clientes/deactivate/${id}/`,
  clientesDetail: (id) => `${BASE_URL}/sales/clientes/detail/${id}/`,

  // PRODUCTOS BAJO PEDIDO
  productosBajoPedidoList: `${BASE_URL}/sales/productos-bajo-pedido/list/`,
  productosBajoPedidoCreate: `${BASE_URL}/sales/productos-bajo-pedido/create/`,
  productosBajoPedidoUpdate: (id) => `${BASE_URL}/sales/productos-bajo-pedido/update/${id}/`,
  productosBajoPedidoActivate: (id) => `${BASE_URL}/sales/productos-bajo-pedido/activate/${id}/`,
  productosBajoPedidoDeactivate: (id) => `${BASE_URL}/sales/productos-bajo-pedido/deactivate/${id}/`,
  productosBajoPedidoDetail: (id) => `${BASE_URL}/sales/productos-bajo-pedido/detail/${id}/`,

  // SEPARACIONES
  separacionesList: `${BASE_URL}/sales/separaciones/list/`,
  separacionesCreate: `${BASE_URL}/sales/separaciones/create/`,
  separacionesUpdate: (id) => `${BASE_URL}/sales/separaciones/update/${id}/`,
  separacionesActivate: (id) => `${BASE_URL}/sales/separaciones/activate/${id}/`,
  separacionesDeactivate: (id) => `${BASE_URL}/sales/separaciones/deactivate/${id}/`,
  separacionesDetail: (id) => `${BASE_URL}/sales/separaciones/detail/${id}/`,

  // VENTAS
  ventasList: `${BASE_URL}/sales/ventas/list/`,
  ventasCreate: `${BASE_URL}/sales/ventas/create/`,
  ventasUpdate: (id) => `${BASE_URL}/sales/ventas/update/${id}/`,
  ventasDelete: (id) => `${BASE_URL}/sales/ventas/delete/${id}/`,
  ventasDetail: (id) => `${BASE_URL}/sales/ventas/detail/${id}/`,
  ventasDeactivate: (id) => `${BASE_URL}/sales/ventas/deactivate/${id}/`,

  // INVOICES
  invoicesList: `${BASE_URL}/sales/invoices/list/`,
  invoicesCreate: `${BASE_URL}/sales/invoices/create/`,
  invoiceDetail: (id) => `${BASE_URL}/sales/invoices/detail/${id}/`,
  invoiceUpdate: (id) => `${BASE_URL}/sales/invoices/update/${id}/`,
  invoiceDelete: (id) => `${BASE_URL}/sales/invoices/delete/${id}/`,
  invoiceDownload: (id) => `${BASE_URL}/sales/invoices/${id}/download/`,
  invoiceResendEmail: (id) => `${BASE_URL}/sales/invoices/${id}/resend_email/`,
  invoiceParseNL: `${BASE_URL}/sales/invoices/parse_natural_language/`,

  // ORDENES DE COMPRA
  ordenesCompraList: `${BASE_URL}/purchases/ordenes-compra/list/`,
  ordenesCompraCreate: `${BASE_URL}/purchases/ordenes-compra/create/`,
  ordenesCompraUpdate: (id) => `${BASE_URL}/purchases/ordenes-compra/update/${id}/`,
  ordenesCompraActivate: (id) => `${BASE_URL}/purchases/ordenes-compra/activate/${id}/`,
  ordenesCompraDeactivate: (id) => `${BASE_URL}/purchases/ordenes-compra/deactivate/${id}/`,
  ordenesCompraDetail: (id) => `${BASE_URL}/purchases/ordenes-compra/detail/${id}/`,

  // TRM
  trmList: `${BASE_URL}/core/trm/list/`,
  trmCreate: `${BASE_URL}/core/trm/create/`,

  // CARGUE MASIVO
  cargueMasivoPlantilla: (tipoId) =>
    `${BASE_URL}/products/cargue-masivo/plantilla/${tipoId}/`,
  cargueMasivo: `${BASE_URL}/products/cargue-masivo/`,
  cargueMasivoConfirmar: `${BASE_URL}/products/cargue-masivo/confirmar/`,
  productoImagenesUpload: (id) =>
    `${BASE_URL}/products/productos/${id}/imagenes/upload/`,

  // IMPORTACIONES — bulk update of order import costs from xlsx
  importacionPlantilla: `${BASE_URL}/purchases/importaciones/plantilla/`,
  importacionCargar: `${BASE_URL}/purchases/importaciones/cargar/`,
};

export default urls;
export { BASE_URL };
