# Bierland-CMS (UPCEAR-CMS)
(Versión en Español)
Un sistema de gestión de contenidos (CMS) simple diseñado para administrar el sitio web del evento "Bierland Oktober Fest 2025".

Este proyecto está construido con una arquitectura desacoplada (Headless CMS), separando el backend (API) de los frontends (página pública y panel de administración).

Arquitectura del Proyecto
El repositorio está estructurado en tres componentes principales:

Backend (/backend): Una API RESTful construida con Node.js y Express. Se encarga de la lógica de negocio, autenticación y la conexión con la base de datos MongoDB.

Frontend (Público) (/frontend): El sitio web principal del evento que consume la API del backend para mostrar información y la lista de franquicias. Está configurado para desplegarse en https://upcear-cms.netlify.app.

Admin (/admin): Un panel de administración simple (HTML/CSS/JS) para gestionar el contenido del sitio. Está configurado para desplegarse en https://upcear-cms-admin.netlify.app.

Características Principales
Gestión de Franquicias: El administrador puede añadir, editar y eliminar las franquicias (expositores) que se muestran en la página pública.

Gestión de Página Principal: Permite editar el contenido global de la página de inicio.

Autenticación: Sistema de login basado en JSON Web Tokens (JWT) para proteger el panel de administración.

Subida de Archivos: Utiliza multer para gestionar la subida de imágenes (como logos o fotos de productos).

Stack Tecnológico
Backend:

Node.js

Express

Mongoose (MongoDB)

bcryptjs (para hash de contraseñas)

jsonwebtoken (para autenticación)

Multer (para subida de archivos)

CORS

dotenv (para variables de entorno)

Frontend / Admin:

HTML5

CSS3

JavaScript (para consumir la API)

Instalación y Ejecución (Backend)
Clona este repositorio.

Navega a la carpeta del backend: cd backend

Crea un archivo .env en la raíz de /backend y añade las variables de entorno necesarias (como PORT, MONGO_URI, JWT_SECRET).

Instala las dependencias:

Bash

npm install
Inicia el servidor de desarrollo (con nodemon):

Bash

npm run dev 
(Nota: El package.json muestra un script start, pero nodemon está como devDependency, usualmente usado con npm run dev. Si no existe dev, usa npm start).

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

(English Version)
Bierland-CMS (UPCEAR-CMS)
A simple Content Management System (CMS) designed to manage the "Bierland Oktober Fest 2025" event website.

This project is built with a decoupled (Headless CMS) architecture, separating the backend (API) from the frontends (public site and admin panel).

Project Architecture
The repository is structured into three main components:

Backend (/backend): A RESTful API built with Node.js and Express. It handles business logic, authentication, and the connection to the MongoDB database.

Frontend (Public) (/frontend): The main event website that consumes the backend API to display information and the franchise list. It is configured to be deployed at https://upcear-cms.netlify.app.

Admin (/admin): A simple admin panel (HTML/CSS/JS) used to manage the site's content. It is configured to be deployed at https://upcear-cms-admin.netlify.app.

Main Features
Franchise Management: The administrator can add, edit, and delete franchises (exhibitors) displayed on the public page.

Main Page Management: Allows editing the global content of the homepage.

Authentication: A login system based on JSON Web Tokens (JWT) to protect the admin panel.

File Uploads: Uses multer to handle image uploads (like logos or product photos).

Technology Stack
Backend:

Node.js

Express

Mongoose (MongoDB)

bcryptjs (for password hashing)

jsonwebtoken (for authentication)

Multer (for file uploads)

CORS

dotenv (for environment variables)

Frontend / Admin:

HTML5

CSS3

JavaScript (for API consumption)

Installation and Setup (Backend)
Clone this repository.

Navigate to the backend folder: cd backend

Create a .env file in the /backend root and add the necessary environment variables (like PORT, MONGO_URI, JWT_SECRET).

Install dependencies:

Bash

npm install
Start the development server (with nodemon):

Bash

npm run dev
(Note: The package.json lists a start script, but nodemon is a devDependency, usually run with npm run dev. If dev is not defined, use npm start).


