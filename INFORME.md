# Informe de Análisis - Proyecto Ferretero

## 1. Resumen de la Arquitectura y Tecnologías
El proyecto **Ferretero** es una plataforma de Marketplace especializada en el sector de ferreterías, diseñada para facilitar la interacción entre compradores y vendedores mediante una aplicación móvil y web moderna.

### Stack Tecnológico
*   **Frontend:** [Expo](https://expo.dev/) (React Native) v54.
*   **Navegación:** [Expo Router](https://docs.expo.dev/router/introduction/) (navegación basada en archivos).
*   **Estilos:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS para componentes nativos).
*   **Estado Global:** [Zustand](https://github.com/pmndrs/zustand).
*   **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions).

## 2. Estructura del Repositorio
*   `app/`: Contiene las rutas de la aplicación organizadas por grupos:
    *   `(auth)`: Gestión de sesiones (Login/Registro).
    *   `(buyer_tabs)`: Funcionalidades para el cliente (Home, Carrito, Perfil).
    *   `(vendor_tabs)`: Herramientas para el vendedor (Dashboard, Inventario, Descuentos).
*   `components/`: Componentes UI reutilizables (`ProductCard`, `CategoryCarousel`).
*   `services/`: Lógica de negocio fuera de los componentes:
    *   `etl.ts`: Procesamiento de datos de WhatsApp y OCR (en desarrollo).
    *   `payment.ts`: Simulación e integración de pasarelas de pago.
*   `store/`: Definición de almacenes de estado (Auth, Cart).
*   `supabase_schema.sql`: Definición completa de la base de datos, incluyendo políticas de seguridad RLS y funciones RPC.

## 3. Hallazgos sobre Imágenes de Prueba
Se realizó una búsqueda exhaustiva de archivos multimedia (`.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`) y documentos de datos (`.csv`, `.xlsx`, `.pdf`) en todo el árbol de directorios.

**Resultado:** No existen imágenes de prueba de productos ni documentos de ejemplo en el repositorio actual.

**Archivos encontrados (Activos de marca únicamente):**
*   `assets/images/adaptive-icon.png`
*   `assets/images/favicon.png`
*   `assets/images/icon.png`
*   `assets/images/splash-icon.png`

## 4. Conclusiones y Recomendaciones
*   El sistema está preparado para la carga de imágenes de productos y procesamiento OCR, pero requiere la adición de muestras reales para validar estas funciones en entornos de desarrollo.
*   La lógica de seguridad (RLS) en Supabase es robusta y protege adecuadamente los datos de los usuarios y las transacciones.
*   Se recomienda añadir una carpeta `assets/test_samples/` con imágenes de productos y capturas de listas de precios para facilitar las pruebas del servicio ETL.
