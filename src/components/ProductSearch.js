import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import '../ProductSearch.css';

function ProductSearch() {
  const [todosProductos, setTodosProductos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [codigoProducto, setCodigoProducto] = useState('');
  const [codigoEAN, setCodigoEAN] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState(null);
  const [base, setBase] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProductos() {
      try {
        const response = await fetch('/productos.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTodosProductos(data);
        setProductos(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchProductos();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const resultados = todosProductos.filter(producto =>
      (codigoProducto && producto.Codigo.toString().includes(codigoProducto)) ||
      (codigoEAN && producto['EAN Unidad'].toString().includes(codigoEAN))
    );

    if (resultados.length === 0) {
      setError('No se encontraron productos coincidentes.');
    } else {
      setError('');
    }

    setProductos(resultados);
  };

  const handleReset = () => {
    setCodigoProducto('');
    setCodigoEAN('');
    setFechaIngreso(null);
    setFechaVencimiento(null);
    setBase('');
    setError('');
    setProductos(todosProductos);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);

    const dayFormatted = date.getDate().toString().padStart(2, '0');
    const monthFormatted = (date.getMonth() + 1).toString().padStart(2, '0');
    const yearFormatted = date.getFullYear();

    return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
  };

  const imprimirDatos = () => {
    window.print();
  };

  const guardarComoPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.text('Resultados de Búsqueda', 10, y);
    y += 10;

    productos.forEach((producto, index) => {
      const text = [
        `Producto ${index + 1}:`,
        `Código: ${producto.Codigo}`,
        `Descripción: ${producto.Articulo_descripcion}`,
        `EAN: ${producto['EAN Unidad']}`,
        `Proveedor: ${producto.Proveedor}`,
        `Rubro: ${producto.Rubro}`,
        `Base: ${base}`,
        `Fecha de Ingreso: ${formatDate(fechaIngreso)}`,
        `Fecha de Vencimiento: ${formatDate(fechaVencimiento)}`
      ];

      text.forEach(line => {
        doc.text(line, 10, y);
        y += 10;
      });

      y += 5;
    });

    const fileName = `productos_${codigoProducto}_${formatDate(fechaIngreso)}.pdf`;
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
        <button type="button" onClick={handleReset}>Borrar</button>
      </form>

      {error && <p className="error-message">{error}</p>}

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

      <button onClick={imprimirDatos} className="no-print">Imprimir Resultados</button>
      <button onClick={guardarComoPDF} className="no-print">Guardar como PDF</button>

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
