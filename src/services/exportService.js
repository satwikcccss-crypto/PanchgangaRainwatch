/**
 * EXPORT SERVICE — Panchganga Rain Gauge Network
 * Generates a multi-sheet Excel file (.xls) using XML templates.
 * No external dependencies required.
 */

const formatXmlSheet = (name, rows) => {
  let xml = `<Worksheet ss:Name="${name}"><Table>`;
  
  // Add headers
  if (rows.length > 0) {
    xml += '<Row>';
    Object.keys(rows[0]).forEach(key => {
      xml += `<Cell><Data ss:Type="String">${key}</Data></Cell>`;
    });
    xml += '</Row>';
  }

  // Add data
  rows.forEach(row => {
    xml += '<Row>';
    Object.values(row).forEach(val => {
      const type = typeof val === 'number' ? 'Number' : 'String';
      xml += `<Cell><Data ss:Type="${type}">${val}</Data></Cell>`;
    });
    xml += '</Row>';
  });

  xml += '</Table></Worksheet>';
  return xml;
};

/**
 * Export station dictionary to 3-sheet Excel
 * @param {Object} stationData — { id: dataObj }
 */
export const exportTechnicalData = (stationData) => {
  const stations = Object.values(stationData);
  if (!stations.length) return;

  // Sheet 1: Intensity mm/hr
  const intensityData = stations.map(s => ({
    Station: s.stationName,
    ID: s.stationId,
    'Intensity (mm/hr)': s.hourlyIntensity,
    'Inst. Rate (mm/hr)': s.instantaneousRate,
    'IMD Category': s.imdLevel.label,
    Timestamp: s.timestamp
  }));

  // Sheet 2: Daily Accumulations
  const dailyData = stations.map(s => ({
    Station: s.stationName,
    'Total Today (mm)': s.dailyCumulative,
    '3h Rolling': s.rollingStats?.['3h'] || 0,
    '6h Rolling': s.rollingStats?.['6h'] || 0,
    '12h Rolling': s.rollingStats?.['12h'] || 0,
    '24h Rolling': s.rollingStats?.['24h'] || 0,
    Status: s.status
  }));

  // Sheet 3: System Health
  const healthData = stations.map(s => ({
    Station: s.stationName,
    'Voltage (V)': s.batteryVoltage || 'N/A',
    'Signal (RSSI)': s.signalStrength || 'N/A',
    'Temp (C)': s.temperature || 'N/A',
    'Data Type': s.isMockData ? 'DEMO' : 'LIVE'
  }));

  const template = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  ${formatXmlSheet('Rainfall_Intensity', intensityData)}
  ${formatXmlSheet('Daily_Accumulation', dailyData)}
  ${formatXmlSheet('System_Health', healthData)}
</Workbook>`;

  const blob = new Blob([template], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RTDAS_Panchganga_Export_${new Date().toISOString().split('T')[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};
