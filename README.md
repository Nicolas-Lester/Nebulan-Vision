Nebulan Vision 🚀
Descripción
Nebulan Vision es una plataforma avanzada diseñada para la integración y visualización de modelos de inteligencia artificial, desarrollada como proyecto central de práctica profesional en Nebulan. La aplicación utiliza una arquitectura moderna basada en la nube para permitir la interacción con modelos de IA a través del protocolo MCP (Model Context Protocol).

Características Principales
Arquitectura Serverless: Backend escalable implementado con Azure Functions en Python.

Interfaz Moderna: Frontend con diseño premium en modo oscuro ("Nebulan premium dark theme").

Gestión de Datos: Integración con Azure Blob Storage para el almacenamiento eficiente de archivos y recursos.


Tecnologías Utilizadas
Hospedaje: Azure Static Web Apps.

Lenguaje: Python (Backend) y JavaScript/HTML (Frontend).

Automatización: CI/CD gestionado a través de GitHub Actions.

Estructura del Proyecto
El repositorio está organizado para separar claramente las responsabilidades del sistema:

api/: Directorio que contiene las funciones de Azure y la lógica de procesamiento del servidor.

frontend/: Código fuente de la interfaz de usuario y componentes visuales.

.github/workflows/: Archivos de configuración para el despliegue automático en Azure.

host.json: Configuración global para el entorno de ejecución de las funciones.

Despliegue
El proyecto cuenta con un flujo de trabajo automatizado. Cualquier cambio realizado en la rama master del repositorio de GitHub se despliega automáticamente en el entorno de producción en Azure.

Desarrollador: Nicolas Herrera Montes

Mentor: Manuel Ávila

Empresa: Nebulan
