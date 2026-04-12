# Guía de Configuración del Backend (Supabase)

Esta guía te ayudará a configurar el backend de la aplicación **Ferretero** utilizando Supabase.

## 1. Crear un Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com/) e inicia sesión.
2. Crea un nuevo proyecto.
3. Anota la **URL del proyecto** y la **Anon Key** (las necesitarás más adelante).

## 2. Configurar la Base de Datos

Para crear las tablas, políticas de seguridad (RLS) y funciones necesarias, sigue estos pasos:

1. En el panel lateral de Supabase, ve a **SQL Editor**.
2. Haz clic en **New Query**.
3. Abre el archivo `supabase_schema.sql` que se encuentra en la raíz de este repositorio.
4. Copia todo el contenido del archivo y pégalo en el editor de SQL de Supabase.
5. Haz clic en **Run**.

Esto creará:
- Las tablas: `profiles`, `categories`, `stores`, `products`, `quotations`, `quotation_items`, `vendor_discounts`, `orders`, `order_items`.
- Las categorías iniciales.
- La función RPC `place_order` para gestionar pedidos de forma atómica.
- Todas las políticas de Row Level Security (RLS).

## 3. Configurar la Autenticación

Por defecto, Supabase tiene habilitada la autenticación por email. Asegúrate de:

1. Ir a **Authentication** > **Providers**.
2. Verificar que **Email** esté habilitado.
3. (Opcional) Deshabilitar **Confirm Email** si deseas probar el registro rápidamente sin necesidad de verificar correos reales durante el desarrollo.

## 4. Configurar Variables de Entorno en el Frontend

Para que la aplicación móvil se comunique con Supabase:

1. En la raíz del proyecto, crea un archivo llamado `.env` (puedes copiar el contenido de `.env.example`).
2. Rellena los valores con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=tu-url-de-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 5. Almacenamiento (Storage)

Si planeas subir imágenes de productos:

1. Ve a **Storage** en el panel lateral.
2. Crea un nuevo bucket llamado `product-images`.
3. Configúralo como **Public**.
4. Agrega políticas de RLS para permitir que los usuarios autenticados suban archivos (o específicamente los vendedores).

## 6. Probar la Conexión

Una vez configurado todo, puedes iniciar la aplicación:

```bash
npm install
npx expo start
```

Si al registrarte o iniciar sesión no ves errores de conexión, el backend está configurado correctamente.
