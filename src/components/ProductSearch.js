import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import '../ProductSearch.css'; // Importar el archivo CSS

function ProductSearch() {
  const [todosProductos, setTodosProductos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [codigoEAN, setCodigoEAN] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(null);
  const [base, setBase] = useState('');
  const [error, setError] = useState(''); // Estado para manejar el mensaje de error

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

    if (resultados.length === 0) {
      setError('No se encontraron productos coincidentes. Solicitar al encargado que se complete los datos correspondiente del producto.');
    } else {
      setError('');
    }

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
        `Base: ${base}`, // Agregar la base a los resultados
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
      <h2 className="no-print">Buscar Producto</h2>
      <form onSubmit={handleSearch} className="no-print">
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
        <label>Base:</label>
        <input
          type="number"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          min="10"
          max="99"
        />
        <br />
        <button type="submit">Buscar</button>
      </form>

      {error && <p className="error-message">{error}</p>} {/* Mostrar mensaje de error si existe */}

      <h3 className='no-print'>Resultados:</h3>
      <ul className="print-results">
        {productos.map((producto, index) => (
          <li key={index}>
            <h1 className='ingreso'>INGRESO: {formatDate(fechaIngreso)}</h1>
            <h1 className='cod'> {producto.Codigo}</h1>
            <h1> {producto.Articulo_descripcion}</h1>
            <div className='flex'>
              <h1 className='base'>BASE: {base}</h1>
              <h1 className='vto'>VTO: {formatDate(fechaVencimiento)}</h1>
            </div>
          </li>
        ))}
      </ul>

      {/* Botones para imprimir y guardar como PDF */}
      <button onClick={imprimirDatos} className="no-print">Imprimir Resultados</button>
      <button onClick={guardarComoPDF} className="no-print">Guardar como PDF</button>

      {/* CSS para ocultar el formulario y título durante la impresión */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductSearch;
