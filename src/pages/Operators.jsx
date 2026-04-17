import * as XLSX from 'xlsx';
export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [uploadedOperators, setUploadedOperators] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [basinFilter, setBasinFilter] = useState('');
  const [msaFilter, setMsaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // ✅ FILE UPLOAD HANDLER
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      console.log("UPLOADED DATA:", json);

      const mapped = json.map((row, index) => ({
        id: `upload-${index}`,
        name: row.Operator || row.operator || row.Company || 'Unknown',
        basin: row.Basin || row.basin || '',
        active_rig_count: row.Rigs || row.rigs || 0,
        msa_status: 'Not Started'
      }));

      setUploadedOperators(mapped);
    };

    reader.readAsArrayBuffer(file);
  };

  // 🔄 COMBINE API + UPLOADED DATA
  const allOperators = [...operators, ...uploadedOperators];

  // 🔍 FILTER LOGIC
  const filtered = allOperators.filter(o => {
    if (search && !o.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (basinFilter && o.basin !== basinFilter) return false;
    if (msaFilter && (o.msa_status || 'Not Started') !== msaFilter) return false;
    if (typeFilter && (o.operator_type || 'public') !== typeFilter) return false;
    return true;
  });

  return (
    <div className="page-content">

      <div className="page-header">
        <div>
          <h1>Operators</h1>
          <p>Upload Excel or manage operators</p>
        </div>
      </div>

      {/* ✅ FILTERS + UPLOAD */}
      <div className="filters-bar">

        <input
          type="file"
          accept=".xlsx, .csv"
          onChange={handleFileUpload}
          style={{ fontSize: 12 }}
        />

        <input
          placeholder="Search operators..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={basinFilter} onChange={e => setBasinFilter(e.target.value)}>
          <option value="">All Basins</option>
          {BASINS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select value={msaFilter} onChange={e => setMsaFilter(e.target.value)}>
          <option value="">All MSA Status</option>
          {MSA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

      </div>

      {/* TABLE */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Basin</th>
                <th>Rigs</th>
                <th>MSA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(op => (
                <tr key={op.id}>
                  <td>{op.name}</td>
                  <td>{op.basin || '—'}</td>
                  <td>{op.active_rig_count || 0}</td>
                  <td>{op.msa_status || 'Not Started'}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>No operators found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
