import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

function ProductSearch() {
  const [todosProductos, setTodosProductos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [codigoEAN, setCodigoEAN] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(null); // Cambiado a null para mejor manejo
  const [fechaVencimiento, setFechaVencimiento] = useState(null); // Cambiado a null para mejor manejo

  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await fetch('/productos.json'); // Cargar el archivo JSON desde la carpeta public
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTodosProductos(data);
        setProductos(data); // Inicialmente mostrar todos los productos
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchProductos();
  }, []); // Este efecto se ejecuta solo una vez al montar el componente

  const handleSearch = (event) => {
    event.preventDefault();

    // Filtrar los productos según el código de producto o el código EAN
    const resultados = todosProductos.filter(producto =>
      (codigoProducto && producto.Codigo.toString().includes(codigoProducto)) ||
      (codigoEAN && producto['EAN Unidad'].toString().includes(codigoEAN))
    );

    setProductos(resultados);
  };

  // Función para formatear la fecha en formato día/mes/año
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day); // Restar 1 al mes porque en JavaScript los meses van de 0 a 11

    const dayFormatted = date.getDate().toString().padStart(2, '0');
    const monthFormatted = (date.getMonth() + 1).toString().padStart(2, '0');
    const yearFormatted = date.getFullYear();

    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  };

  // Función para imprimir los datos
  const imprimirDatos = () => {
    // Llamar a la función de impresión del navegador
    window.print();
  };

  // Función para guardar como PDF con nombre personalizado
  const guardarComoPDF = () => {
    const doc = new jsPDF();

    // Definir posición inicial del texto
    let y = 10;

    // Agregar título
    doc.text('Resultados de Búsqueda', 10, y);
    y += 10;

    // Agregar productos al documento
    productos.forEach((producto, index) => {
      const text = [
        `Producto ${index + 1}:`,
        `Código: ${producto.Codigo}`,
        `Descripción: ${producto.Articulo_descripcion}`,
        `EAN: ${producto['EAN Unidad']}`,
        `Proveedor: ${producto.Proveedor}`,
        `Rubro: ${producto.Rubro}`,
        `Fecha de Ingreso: ${formatDate(fechaIngreso)}`, // Asegurar que se obtiene correctamente
        `Fecha de Vencimiento: ${formatDate(fechaVencimiento)}` // Asegurar que se obtiene correctamente
      ];

      // Agregar texto al documento
      text.forEach(line => {
        doc.text(line, 10, y);
        y += 10;
      });

      // Agregar espacio entre productos
      y += 5;
    });

    // Nombre del archivo con código de producto y fecha
    const fileName = `productos_${codigoProducto}_${formatDate(fechaIngreso)}.pdf`;

    // Guardar el documento como PDF con nombre personalizado
    doc.save(fileName);
  };

  return (
    <div>
      <h2>Buscar Producto</h2>
      <form onSubmit={handleSearch}>
        <label>Código de Producto:</label>
        <input
          type="text"
          value={codigoProducto}
          onChange={(e) => setCodigoProducto(e.target.value)}
        />
        <br />
        <label>Código EAN:</label>
        <input
          type="text"
          value={codigoEAN}
          onChange={(e) => setCodigoEAN(e.target.value)}
        />
        <br />
        <label>Fecha de Ingreso:</label>
        <input
          type="date"
          value={fechaIngreso || ''}
          onChange={(e) => setFechaIngreso(e.target.value)}
        />
        <br />
        <label>Fecha de Vencimiento:</label>
        <input
          type="date"
          value={fechaVencimiento || ''}
          onChange={(e) => setFechaVencimiento(e.target.value)}
        />
        <br />
        <button type="submit">Buscar</button>
      </form>

      <h3>Resultados:</h3>
      <ul>
        {productos.map((producto, index) => (
          <li key={index}>
            <p>Código: {producto.Codigo}</p>
            <p>Descripción: {producto.Articulo_descripcion}</p>
            <p>EAN: {producto['EAN Unidad']}</p>
            <p>Proveedor: {producto.Proveedor}</p>
            <p>Rubro: {producto.Rubro}</p>
            <p>Fecha de Ingreso: {formatDate(fechaIngreso)}</p>
            <p>Fecha de Vencimiento: {formatDate(fechaVencimiento)}</p>
          </li>
        ))}
      </ul>

      {/* Botones para imprimir y guardar como PDF */}
      <button onClick={imprimirDatos}>Imprimir Resultados</button>
      <button onClick={guardarComoPDF}>Guardar como PDF</button>
    </div>
  );
}

export default ProductSearch;
