# Guía de Despliegue en Vercel para el Proyecto Biocode

Esta guía detalla los pasos para desplegar el sitio web de Astro en Vercel, configurado para renderizado en servidor (SSR).

## Prerrequisitos

1.  **Cuenta de Vercel:** Necesitas una cuenta en [Vercel](https://vercel.com). Puedes registrarte gratis con tu cuenta de GitHub, GitLab o Bitbucket.
2.  **Cuenta de Git:** El código del proyecto debe estar en un repositorio de Git (ej. GitHub).
3.  **Node.js:** Asegúrate de tener Node.js instalado en tu máquina local para ejecutar los comandos.

---

## Paso 1: Instalar el Adaptador de Vercel

Para que Astro pueda funcionar en la infraestructura de Vercel, necesita un "adaptador". Este paquete se encarga de traducir la salida del servidor de Astro a un formato que Vercel entienda (Serverless Functions).

1.  Abre una terminal en el directorio del proyecto web (`biocode/output/web`).
2.  Ejecuta el siguiente comando para añadir el adaptador de Vercel:

    ```bash
    npx astro add vercel
    ```

3.  El comando te hará algunas preguntas. Responde afirmativamente (`y`). Esto instalará el paquete `@astrojs/vercel` y modificará automáticamente tu archivo `astro.config.mjs` para incluir el adaptador.

---

## Paso 2: Subir el Proyecto a un Repositorio Git

Vercel se integra directamente con tu proveedor de Git para automatizar los despliegues.

1.  Crea un nuevo repositorio en GitHub, GitLab o Bitbucket.
2.  Asegúrate de que el contenido del directorio `biocode/output/web` esté en ese repositorio.
3.  Sube los últimos cambios, incluyendo los archivos modificados por el comando `astro add vercel` (`astro.config.mjs`, `package.json`, `package-lock.json`).

---

## Paso 3: Importar y Desplegar el Proyecto en Vercel

1.  Inicia sesión en tu [dashboard de Vercel](https://vercel.com/dashboard).
2.  Haz clic en **"Add New..." -> "Project"**.
3.  Selecciona el repositorio de Git donde subiste el proyecto.
4.  Vercel detectará automáticamente que es un proyecto de Astro y configurará los ajustes de build por ti. No deberías necesitar cambiar nada.
5.  Antes de desplegar, ve a la sección **"Environment Variables"** para el siguiente paso.

---

## Paso 4: Configurar las Variables de Entorno

Este es un paso **crítico**. El proyecto necesita estas claves para conectarse a Supabase, Resend y para proteger sus propias APIs.

En la configuración de tu proyecto en Vercel, añade las siguientes variables de entorno:

*   `PUBLIC_SUPABASE_URL`: La URL de tu proyecto de Supabase.
*   `PUBLIC_SUPABASE_ANON_KEY`: La clave anónima (public) de tu proyecto de Supabase.
*   `SUPABASE_SERVICE_KEY`: La clave de servicio (secreta) de tu proyecto de Supabase.
*   `RESEND_API_KEY`: Tu clave de API de Resend.
*   `SEND_NEWSLETTER_SECRET`: La clave secreta que creamos para proteger el endpoint de envío de newsletters.
*   `PUBLIC_BASE_URL`: La URL final de tu sitio en producción (ej. `https://mi-sitio.vercel.app`).
*   `DASHBOARD_PASSWORD`: La contraseña que protege la página del dashboard.

**Importante:** Asegúrate de que los valores sean los correctos para tu entorno de producción.

---

## Paso 5: Desplegar

1.  Una vez configuradas las variables de entorno, haz clic en el botón **"Deploy"**.
2.  Vercel comenzará el proceso de build y despliegue. Tomará uno o dos minutos.
3.  ¡Listo! Una vez finalizado, Vercel te proporcionará la URL de tu sitio en producción.

A partir de ahora, cada vez que hagas un `git push` a tu rama principal, Vercel automáticamente desplegará los cambios.
