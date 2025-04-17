import { useState } from 'react';
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // API URL
  const API_URL = 'http://localhost:8000';

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      setCsvData([]);
      setHeaders([]);
      setFileName('');
      return;
    }
    
    setFileName(file.name);
    setError('');
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Create form data object to send file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send file to server for processing
      const response = await fetch(`${API_URL}/file`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error processing file');
      }
      
      const data = await response.json();
      processServerResponse(data);
      setSuccessMessage('File processed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to process file');
      setCsvData([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const processServerResponse = (data) => {
    if (!data.rows || data.rows.length === 0) {
      setError('No data found in CSV file');
      setCsvData([]);
      setHeaders([]);
      return;
    }
    
    // Extract headers from the first row object's keys
    const extractedHeaders = Object.keys(data.rows[0]);
    setHeaders(extractedHeaders);
    
    // Set the processed data
    setCsvData(data.rows);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CSV Table Viewer</h1>
      </header>
      
      <main className="app-main">
        <section className="upload-section">
          <h2>Upload CSV File</h2>
          <div className="file-input-container">
            <input
              type="file"
              id="csvFileInput"
              onChange={handleFileUpload}
              accept=".csv"
              disabled={isLoading}
            />
          </div>
          
          {isLoading && <div className="loading-message">Processing file, please wait...</div>}
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          {fileName && !isLoading && <div className="file-info">File: {fileName}</div>}
        </section>
        
        {csvData.length > 0 && (
          <section className="data-section">
            <h2>CSV Data (Server Processed)</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((header, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;