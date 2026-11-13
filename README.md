# Mis Ganancias — Calculadora para inDrive

Aplicación móvil hecha con Expo / React Native.

## Qué incluye
- Calcula ganancia neta: ingresos − gasolina − otros gastos.
- Muestra el resultado al instante en pesos dominicanos (RD$).
- Guarda cada día en un historial local del dispositivo.
- Permite borrar el historial.
- Diseño sencillo tipo libreta con símbolo de dólar.

## Cómo abrir el proyecto
Necesitas Node.js y Expo. En una computadora, descomprime el ZIP, abre una terminal dentro de la carpeta y ejecuta:

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go para probarlo. Para generar un APK Android de instalación:

```bash
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

En el flujo de EAS Build tendrás que iniciar sesión con una cuenta Expo. El APK no está incluido en este ZIP; este archivo contiene el proyecto editable.

## Nota
Los registros se guardan en el almacenamiento local de la aplicación. Si desinstalas la app o borras sus datos, el historial podría perderse.
