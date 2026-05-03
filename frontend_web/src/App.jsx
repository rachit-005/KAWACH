import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Smartphone, Wifi, Key, AlertTriangle, Link as LinkIcon, Database, CheckCircle, Eye, EyeOff, Globe, Download, Activity, Search, Trash2 } from 'lucide-react';
import './App.css';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://127.0.0.1:5000' 
  : 'https://your-backend-name.onrender.com'; // Change this after deploying backend

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDocs, setShowDocs] = useState(false);
  
  // Dashboard State
  const [scoreData, setScoreData] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);

  // Phishing State
  const [url, setUrl] = useState('');
  const [phishResult, setPhishResult] = useState(null);
  const [loadingPhish, setLoadingPhish] = useState(false);

  // Breach State
  const [breachEmail, setBreachEmail] = useState('');
  const [breachResult, setBreachResult] = useState(null);
  const [loadingBreach, setLoadingBreach] = useState(false);

  // OSINT State
  const [osintInput, setOsintInput] = useState('');
  const [osintResult, setOsintResult] = useState(null);
  const [loadingOsint, setLoadingOsint] = useState(false);

  // Vault State
  const [vaultData, setVaultData] = useState([]);
  const [newVault, setNewVault] = useState({ website: '', username: '', password: '' });
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    fetchScore();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scan/history`);
      setScanHistory(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchScore = async () => {
    setLoadingScore(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/scan/score`, {
        breached_accounts: 0,
        weak_passwords: 0
      });
      setScoreData(response.data);
      
      // Auto-save this scan to history
      await axios.post(`${API_BASE_URL}/api/scan/save`, {
        score: response.data.score,
        device_risks: response.data.breakdown.device_deduction / 10,
        network_risks: response.data.breakdown.network_deduction > 0 ? 1 : 0
      });
      fetchHistory();
    } catch (error) {
      console.error("Backend error", error);
    }
    setLoadingScore(false);
  };

  const checkPhishing = async () => {
    setLoadingPhish(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/phishing/check`, { url });
      setPhishResult(response.data);
    } catch (e) {
      console.error(e);
    }
    setLoadingPhish(false);
  };

  const checkBreach = async () => {
    setLoadingBreach(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/breach/email`, { email: breachEmail });
      setBreachResult(response.data);
    } catch (e) {
      console.error(e);
    }
    setLoadingBreach(false);
  };

  const checkOsint = async () => {
    setLoadingOsint(true);
    try {
      setOsintResult(null);
      const cleanInput = osintInput.trim();
      const response = await axios.post(`${API_BASE_URL}/api/osint/scan`, { username: cleanInput });
      setOsintResult(response.data);
    } catch (e) {
      console.error(e);
    }
    setLoadingOsint(false);
  };

  const fetchVault = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vault`);
      setVaultData(response.data.vault);
    } catch (e) {
      console.error(e);
    }
  };

  const saveToVault = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/vault`, newVault);
      setNewVault({ website: '', username: '', password: '' });
      fetchVault();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFromVault = async (id) => {
    if (window.confirm("Are you sure you want to delete this password?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/vault/${id}`);
        fetchVault();
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'vault') fetchVault();
  }, [activeTab]);

  const getPasswordHygiene = (password) => {
    if (password.length > 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { label: 'Strong', color: '#10b981' };
    }
    if (password.length > 8) {
      return { label: 'Moderate', color: '#f59e0b' };
    }
    return { label: 'Weak', color: '#ef4444' };
  };

  const renderDashboard = () => {
    if (loadingScore || !scoreData) return (
      <div style={{textAlign:'center', padding: '5rem'}}>
        <div className="spinner"></div>
        <p style={{marginTop: '1rem', color: '#38bdf8'}}>Scanning System Hardware & Network...</p>
      </div>
    );
    
    const color = scoreData.score >= 80 ? '#10b981' : scoreData.score >= 50 ? '#f59e0b' : '#ef4444';
    const deg = `${(scoreData.score / 100) * 360}deg`;

    const adv = scoreData.advanced_metrics || {
      dev_mode: "Unknown", system_update: "Unknown", wifi_protocol: "Unknown", malicious_apps: 0
    };

    return (
      <div>
        <h2 className="gradient-heading"><Shield color="#38bdf8" /> Device Security Scanner</h2>
        <p style={{color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6'}}>
          This module performs a real-time, low-level OS scan. It checks registry vulnerabilities, Wi-Fi protocols, and active processes for hacking tools.
        </p>
        <div className="dashboard-grid">
          <div className="score-section">
            <h2 style={{fontWeight: 'normal', color: 'var(--text-secondary)'}}>Health Score</h2>
            <div className="score-circle" style={{ '--score-color': color, '--score-deg': deg }}>
              <div className="score-inner">{scoreData.score}</div>
            </div>
            <h3 style={{ color }}>{scoreData.status}</h3>
            
            {scanHistory.length > 0 && (
              <div style={{marginTop: '2rem', width: '100%', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px'}}>
                <h4 style={{fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem'}}>Recent Scans</h4>
                {scanHistory.slice(0, 5).map((h, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem'}}>
                    <span style={{color: '#94a3b8'}}>{new Date(h.scan_date).toLocaleDateString()}</span>
                    <span style={{fontWeight: 'bold', color: h.cyber_health_score >= 80 ? '#10b981' : '#f59e0b'}}>{h.cyber_health_score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="details-section">
            <div className="detail-item">
              <div className="detail-icon"><Smartphone /></div>
              <div>
                <h3>System Integrity</h3>
                <p style={{fontSize: '0.85rem', color: '#cbd5e1'}}>OS Update: <span style={{color: adv.system_update?.includes('Up to date') ? '#10b981' : '#f59e0b'}}>{adv.system_update}</span></p>
                <p style={{fontSize: '0.85rem', color: '#cbd5e1'}}>Developer Mode: <span style={{color: adv.dev_mode === 'Disabled' ? '#10b981' : '#ef4444'}}>{adv.dev_mode}</span></p>
                <p style={{fontSize: '0.85rem', color: '#cbd5e1'}}>Malicious Permissions: <span style={{color: adv.malicious_apps === 0 ? '#10b981' : '#ef4444'}}>{adv.malicious_apps} detected</span></p>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon"><Wifi /></div>
              <div>
                <h3>Network Interfaces</h3>
                <p style={{fontSize: '0.85rem', color: '#cbd5e1'}}>Protocol: <span style={{color: '#38bdf8'}}>{adv.wifi_protocol}</span></p>
                <p style={{fontSize: '0.85rem', color: '#cbd5e1'}}>{scoreData.breakdown.network_deduction === 0 ? 'No suspicious ports found' : 'Unsecured Local Ports Detected'}</p>
              </div>
            </div>
            <button className="action-btn" onClick={fetchScore} style={{marginTop: '1rem'}}>Run Full Scan Again</button>
          </div>
        </div>
      </div>
    );
  };


  const renderVault = () => (
    <div>
      <h2 className="gradient-heading"><Database color="#38bdf8" /> Password Manager (AES-256)</h2>
      <p style={{marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
        This is a Google-Style Password Vault. When you save a password, the Python backend generates a secure Initialization Vector (IV) and encrypts it using military-grade <b>AES-256</b> before it ever touches the SQLite database. It includes a dynamic Password Hygiene evaluator.
      </p>
      
      <div className="input-group" style={{background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px'}}>
        <input placeholder="Website (e.g., google.com)" className="input-field" value={newVault.website} onChange={e => setNewVault({...newVault, website: e.target.value})} />
        <input placeholder="Username" className="input-field" value={newVault.username} onChange={e => setNewVault({...newVault, username: e.target.value})} />
        <input type="password" placeholder="Password" className="input-field" value={newVault.password} onChange={e => setNewVault({...newVault, password: e.target.value})} />
        <button className="action-btn" onClick={saveToVault}>Encrypt & Save to Vault</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem'}}>
        {vaultData.map((item) => {
          const hygiene = getPasswordHygiene(item.password || '');
          return (
            <div key={item.id} style={{background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: hygiene.color}}></div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Globe size={18}/> {item.website}</h3>
                <button 
                  onClick={() => deleteFromVault(item.id)}
                  style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px'}}
                  title="Delete Entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem'}}>{item.username}</p>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px'}}>
                <span style={{fontFamily: 'monospace', letterSpacing: '2px'}}>
                  {showPasswords[item.id] ? item.password : '••••••••'}
                </span>
                <button 
                  style={{background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer'}}
                  onClick={() => setShowPasswords({...showPasswords, [item.id]: !showPasswords[item.id]})}
                >
                  {showPasswords[item.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{marginTop: '1rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#64748b'}}>Hygiene Score:</span>
                <span style={{color: hygiene.color, fontWeight: 'bold'}}>{hygiene.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const renderBreach = () => (
    <div>
      <h2 className="gradient-heading"><AlertTriangle color="#38bdf8" /> Breach Scanner (HIBP)</h2>
      <p style={{marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
        This scanner queries the Have I Been Pwned database. Enter your email address to extract exact information about leaked data classes.
      </p>
      
      <div className="input-group">
        <input 
          type="email" 
          placeholder="Enter your email address" 
          className="input-field"
          value={breachEmail}
          onChange={(e) => setBreachEmail(e.target.value)}
        />
        <button className="action-btn" onClick={checkBreach} disabled={loadingBreach}>
          {loadingBreach ? 'Searching Databases...' : 'Check HIBP Database'}
        </button>
      </div>

      {loadingBreach && (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <div className="spinner"></div>
          <p style={{color: '#94a3b8', marginTop: '1rem'}}>Scanning leaked records...</p>
        </div>
      )}

      {breachResult && !loadingBreach && (
        <div style={{marginTop: '2rem'}}>
          <div className="result-box" style={{ borderColor: breachResult.count > 0 ? '#ef4444' : '#10b981' }}>
            {breachResult.count > 0 ? (
              <h3 style={{color: '#ef4444'}}>⚠️ WARNING: Email found in {breachResult.count} breaches!</h3>
            ) : (
              <h3 style={{color: '#10b981'}}><CheckCircle size={20} style={{verticalAlign:'middle'}}/> Good News! No breaches found.</h3>
            )}
          </div>

          {breachResult.breaches && breachResult.breaches.length > 0 && (
            <div style={{marginTop: '1.5rem', overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#cbd5e1'}}>
                <thead>
                  <tr style={{textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                    <th style={{padding: '0.8rem'}}>Breach Source</th>
                    <th style={{padding: '0.8rem'}}>Date</th>
                    <th style={{padding: '0.8rem'}}>Exposed Data</th>
                  </tr>
                </thead>
                <tbody>
                  {breachResult.breaches.map((b, i) => (
                    <tr key={i} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <td style={{padding: '0.8rem', fontWeight: '600', color: '#fff'}}>{b.Name}</td>
                      <td style={{padding: '0.8rem'}}>{b.BreachDate}</td>
                      <td style={{padding: '0.8rem'}}>
                        {b.DataClasses.map((d, j) => (
                          <span key={j} style={{background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '0.75rem'}}>
                            {d}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderOsint = () => (
    <div>
      <h2 className="gradient-heading"><Search color="#38bdf8" /> OSINT Engine</h2>
      <p style={{marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
        Initiate deep metadata extraction across social registries, developer platforms, and telecom records to build a comprehensive digital footprint.
      </p>
      <div className="input-group">
        <input 
          placeholder="Enter Email, Phone or Username" 
          className="input-field"
          value={osintInput}
          onChange={(e) => setOsintInput(e.target.value)}
        />
        <button className="action-btn" onClick={checkOsint} disabled={loadingOsint}>
          {loadingOsint ? 'Running Engines...' : 'Initiate Extraction'}
        </button>
      </div>

      {loadingOsint && (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <div className="spinner"></div>
          <p style={{marginTop: '1rem', color: '#94a3b8'}}>Extracting digital footprint...</p>
        </div>
      )}

      {osintResult && !loadingOsint && (
        <div style={{marginTop: '2rem'}}>
          <div className="result-box">
            <h3>Found active metadata on {osintResult.profiles_found} platforms.</h3>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem'}}>
            {(osintResult.platforms || []).map((res, i) => (
              <div key={i} style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem'}}>
                  <span style={{fontWeight: 'bold', color: '#38bdf8'}}>{res.platform}</span>
                  <a href={res.url} target="_blank" rel="noreferrer" style={{color: '#94a3b8'}}><Activity size={14}/></a>
                </div>
                <div style={{fontSize: '0.8rem', color: '#cbd5e1'}}>
                  {Object.entries(res.metadata || {}).map(([key, val], j) => (
                    <div key={j} style={{marginBottom: '4px', display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#64748b'}}>{key}:</span>
                      <span>{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPhishing = () => (
    <div>
      <h2 className="gradient-heading"><LinkIcon color="#38bdf8" /> Phishing Link Detector</h2>
      <div className="input-group">
        <input type="text" placeholder="Enter a URL" className="input-field" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="action-btn" onClick={checkPhishing} disabled={loadingPhish}>
          {loadingPhish ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </div>

      {loadingPhish && (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <div className="spinner"></div>
        </div>
      )}

      {phishResult && !loadingPhish && (
        <div className="result-box" style={{ borderColor: phishResult.risk_score > 50 ? '#ef4444' : '#10b981' }}>
          <h3>Status: {phishResult.status}</h3>
          <p>Risk Score: {phishResult.risk_score}/100</p>
        </div>
      )}
    </div>
  );

  const renderExtensionIntegration = () => (
    <div>
      <h2 className="gradient-heading"><Globe color="#38bdf8" /> Live Browser Protection</h2>
      <p style={{color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.6'}}>
        The KAWACH Browser Shield provides real-time phishing detection and safe-web evaluation based on OWASP standards. It intercepts malicious requests before they can reach your browser.
      </p>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        <div style={{background: 'rgba(255,255,255,0.03)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px'}}>
          <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Download size={20}/> 1. Download Package</h3>
          <p style={{fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.5rem'}}>
            Download the pre-packaged KAWACH extension as a .zip file. This contains the manifest and security scripts.
          </p>
          <a href={`${API_BASE_URL}/static/kawach-extension.zip`} download="kawach-extension.zip" style={{textDecoration: 'none'}}>
            <button className="action-btn" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
              Download Extension (.zip)
            </button>
          </a>
        </div>

        <div style={{background: 'rgba(255,255,255,0.03)', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px'}}>
          <h3 style={{marginBottom: '1.2rem'}}>🛠️ 2. Installation Steps</h3>
          <ul style={{fontSize: '0.85rem', color: '#94a3b8', paddingLeft: '1.2rem', lineHeight: '1.8'}}>
            <li><b>Unzip</b> the downloaded file into a folder.</li>
            <li>Open Chrome and navigate to <code style={{color: '#38bdf8'}}>chrome://extensions</code></li>
            <li>Enable <b>Developer mode</b> (top right switch).</li>
            <li>Click <b>Load unpacked</b> button.</li>
            <li>Select the unzipped <b>kawach-extension</b> folder.</li>
            <li>Pin the extension to your toolbar for easy access.</li>
          </ul>
        </div>
      </div>

      <div className="result-box" style={{marginTop: '2rem', background: 'rgba(56, 189, 248, 0.05)', borderLeftColor: '#38bdf8'}}>
        <p style={{fontSize: '0.85rem', color: '#38bdf8', margin: 0}}>
          <b>Pro Tip:</b> Once installed, the extension will automatically highlight phishing links and show a "Safe" badge on trusted websites.
        </p>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">KAWACH</div>
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Shield /> Scanner</div>
        <div className={`nav-item ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}><Database /> Vault</div>
        <div className={`nav-item ${activeTab === 'breach' ? 'active' : ''}`} onClick={() => setActiveTab('breach')}><AlertTriangle /> Breaches</div>
        <div className={`nav-item ${activeTab === 'osint' ? 'active' : ''}`} onClick={() => setActiveTab('osint')}><Search /> OSINT</div>
        <div className={`nav-item ${activeTab === 'phishing' ? 'active' : ''}`} onClick={() => setActiveTab('phishing')}><LinkIcon /> Phishing</div>
        <div className={`nav-item ${activeTab === 'extension' ? 'active' : ''}`} onClick={() => setActiveTab('extension')} style={{marginTop: 'auto'}}><Globe /> Extension</div>
      </div>

      <div className="main-content">
        <div className="glass-panel" style={{minHeight: '600px'}}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'vault' && renderVault()}
          {activeTab === 'breach' && renderBreach()}
          {activeTab === 'osint' && renderOsint()}
          {activeTab === 'phishing' && renderPhishing()}
          {activeTab === 'extension' && renderExtensionIntegration()}
        </div>
      </div>
    </div>
  );
}

export default App;
