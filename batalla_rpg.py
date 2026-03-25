import random

class Personaje:
    """
    Clase base para todos los personajes del juego.
    Contiene la lógica básica de vida, escudo y acciones.
    """
    def __init__(self, nombre, vida, escudo):
        # Atributos básicos
        self.nombre = nombre.capitalize() 
        self.vida = vida
        self.escudo = escudo
        self.esta_vivo = True

    def recibir_daño(self, cantidad):
        """
        Método polimórfico. Incluye ahora una probabilidad de ESQUIVAR.
        """
        # 10% de probabilidad de esquivar (1 de cada 10)
        if random.randint(1, 10) == 1:
            print(f" ¡Increíble! {self.nombre} ha esquivado el ataque completamente.")
            return "ESQUIVADO"

        daño_final = max(0, cantidad - self.escudo)
        self.vida = max(0, self.vida - daño_final) # No bajar de 0
        print(f"-> {self.nombre} recibió {daño_final} de daño. Vida restante: {self.vida}")
        
        if self.vida <= 0:
            self.esta_vivo = False
            print(f"!!! {self.nombre} ha caído en combate !!!")
        return daño_final

    def curar_magia(self):
        """
        Nueva función: Los personajes usan magia para recuperar vida.
        """
        pocion = random.randint(10, 20)
        self.vida += pocion
        print(f" {self.nombre} usa magia y recupera {pocion} de vida! (Vida actual: {self.vida})")

    def mostrar_estado(self):
        # Uso de diccionarios para organizar la información
        estado = {
            "Nombre": self.nombre,
            "Vida": self.vida,
            "Escudo": self.escudo
        }
        print(f"Estado de {self.nombre}: {estado}")

class Guerrero(Personaje):
    """
    Subclase Guerrero: Se especializa en defensa.
    """
    def recibir_daño(self, cantidad):
        # 10% de probabilidad de esquivar
        if random.randint(1, 10) == 1:
            print(f" {self.nombre} se movió rápido y esquivó!")
            return "ESQUIVADO"

        # Bloqueo especial del guerrero
        bloqueo = self.escudo * 1.5
        daño_final = max(0, cantidad - bloqueo)
        
        self.vida = max(0, self.vida - daño_final) # No bajar de 0
        print(f" {self.nombre} bloquea! Recibió {daño_final} de daño. Vida: {self.vida}")
        
        if self.vida <= 0:
            self.esta_vivo = False
        return daño_final

class Orco(Personaje):
    """
    Subclase Orco: Se vuelve más fuerte con cada ataque (furia).
    """
    def __init__(self, nombre, vida, escudo):
        # Llamamos al constructor de la clase base
        super().__init__(nombre, vida, escudo)
        self.furia = 0 # Atributo específico del Orco

    def atacar(self, objetivo):
        # El daño aumenta con la furia
        daño_base = 15
        daño_total = daño_base + (self.furia * 2)
        
        print(f" {self.nombre} ataca con furia nivel {self.furia}!")
        objetivo.recibir_daño(daño_total)
        
        # Aumentar la furia después de atacar
        self.furia += 1

    def recibir_daño(self, cantidad):
        # El orco es duro, ignora el primer impacto pequeño
        if cantidad < 5:
            print(f" {self.nombre} ni lo sintió...")
            return 0
        
        # IMPORTANTE: Usar 'return' para que el daño llegue al historial
        return super().recibir_daño(cantidad)

# --- SIMULACIÓN DE LA BATALLA ---

def iniciar_combate():
    print("=== BIENVENIDO AL COLISEO DE PYTHON ===")
    nombre_jugador = input("Dime el nombre de tu Guerrero: ") or "Arturo"
    
    jugador = Guerrero(nombre_jugador, 100, 10)
    enemigo = Orco("Thrall", 120, 5)
    
    # Acciones y HISTORIAL (Para explicar listas)
    acciones = ["Ataque", "Furia", "Magia"]
    historial = [] 
    
    print(f"\n--- {jugador.nombre} VS {enemigo.nombre} ---")

    turno = 1
    while jugador.esta_vivo and enemigo.esta_vivo and turno <= 15:
        print(f"\n" + "="*30)
        print(f"TURNO {turno}")
        print("="*30)
        
        # --- TURNO DEL JUGADOR ---
        input(f" {jugador.nombre}, ¡presiona ENTER para tirar el dado!...")
        accion_jugador = random.choice(acciones)
        print(f" Resultado: ¡{accion_jugador.upper()}!")

        if accion_jugador == "Ataque":
            daño = random.randint(18, 28)
            print(f" Tajo de {daño} puntos.")
            res = enemigo.recibir_daño(daño)
            historial.append(f"Turno {turno}: {jugador.nombre} usó Ataque ({res})")
        elif accion_jugador == "Furia":
            daño = random.randint(30, 45)
            print(f" ¡Furia! Daño de {daño} puntos.")
            res = enemigo.recibir_daño(daño)
            historial.append(f"Turno {turno}: {jugador.nombre} usó FURIA ({res})")
        elif accion_jugador == "Magia":
            jugador.curar_magia()
            historial.append(f"Turno {turno}: {jugador.nombre} usó MAGIA")

        if not enemigo.esta_vivo: break

        # --- TURNO DEL ORCO ---
        print(f"\n Turno de {enemigo.nombre}...")
        accion_enemigo = random.choice(acciones)
        
        if accion_enemigo == "Ataque":
            enemigo.atacar(jugador)
            historial.append(f"Turno {turno}: {enemigo.nombre} ATACÓ")
        elif accion_enemigo == "Furia":
            daño_furia = random.randint(25, 35) + enemigo.furia
            print(f" {enemigo.nombre} golpea con {daño_furia}!")
            jugador.recibir_daño(daño_furia)
            enemigo.furia += 1
            historial.append(f"Turno {turno}: {enemigo.nombre} usó FURIA")
        elif accion_enemigo == "Magia":
            enemigo.curar_magia()
            historial.append(f"Turno {turno}: {enemigo.nombre} usó MAGIA")

        print(f"\n>> STATUS: {jugador.nombre}: {jugador.vida} HP | {enemigo.nombre}: {enemigo.vida} HP")
        turno += 1

    print("\n" + "*" * 25)
    print("      FIN DEL DUELO      ")
    print("*" * 25)
    
    # --- RESUMEN FINAL ---
    print("\n HISTORIAL DE LA BATALLA:")
    for evento in historial:
        print(f"  - {evento}")

    if jugador.esta_vivo and not enemigo.esta_vivo:
        print(f"\n ¡VICTORIA PARA {jugador.nombre.upper()}!")
    elif enemigo.esta_vivo and not jugador.esta_vivo:
        print(f"\n {jugador.nombre} ha sido derrotado...")
    else:
        print("\n ¡Empate técnico!")

    print("\n" + "=" * 25)
    print("FIN DE LA BATALLA")
    if jugador.esta_vivo and not enemigo.esta_vivo:
        print(f" ¡EL GANADOR ES {jugador.nombre.upper()}!") # Uso de .upper() 
    elif enemigo.esta_vivo and not jugador.esta_vivo:
        print(f" EL GANADOR ES {enemigo.nombre.upper()}...")
    else:
        print(" El combate terminó en un empate técnico.")
    print("=" * 25)

if __name__ == "__main__":
    iniciar_combate()
