const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      remove: ['GenerateSW'], // Elimina cualquier instancia previa de GenerateSW
      add: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Ajusta el límite de tamaño máximo si es necesario
          // Aquí puedes agregar más configuraciones si las necesitas
        }),
      ],
    },
  },
};
