import random

class Personaje:
    """
    Clase base para todos los personajes del juego.
    Contiene la lógica básica de vida, escudo y acciones.
    """
    def __init__(self, nombre, vida, escudo):
        # Guardamos los datos iniciales del personaje.
        # capitalize() pone la primera letra en mayúscula para mostrar el nombre más prolijo.
        self.nombre = nombre.capitalize() 
        self.vida = vida
        self.escudo = escudo
        # Este atributo se usa para controlar cuándo termina la batalla.
        self.esta_vivo = True

    def recibir_daño(self, cantidad):
        """
        Polimorfismo. Incluye ahora una probabilidad de ESQUIVAR.
        """
        # random.randint(1, 7) genera un número aleatorio entre 1 y 7.
        # Si sale 1, el personaje esquiva y no recibe daño.
        if random.randint(1, 7) == 1:
            print(f" ¡Increíble! {self.nombre} ha esquivado el ataque completamente.")
            return "ESQUIVADO"

        # El daño real se calcula restando el escudo al daño recibido.
        # max(0, ...) evita que el daño sea negativo.
        daño_final = max(0, cantidad - self.escudo) 
        # También usamos max(0, ...) para que la vida nunca quede debajo de 0.
        self.vida = max(0, self.vida - daño_final)
        print(f"-> {self.nombre} recibió {daño_final} de daño. Vida restante: {self.vida}")
        
        # Si la vida llega a 0, el personaje queda fuera del combate.
        if self.vida <= 0:
            self.esta_vivo = False
            print(f"!!! {self.nombre} ha caído en combate !!!")

        # Devolvemos el daño final para poder guardarlo en el historial.
        return daño_final

    def curar_magia(self):
        """
        Nueva función: Los personajes usan magia para recuperar vida.
        """
        # La curación es aleatoria entre 10 y 20 puntos.
        pocion = random.randint(10, 20)
        self.vida += pocion
        print(f" {self.nombre} usa magia y recupera {pocion} de vida! (Vida actual: {self.vida})")

    def mostrar_estado(self):
        # Diccionario simple para mostrar el estado del personaje.
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
        # El guerrero tiene su propia versión de recibir_daño.
        # Eso es polimorfismo: la misma acción se comporta distinto según la clase.
        if random.randint(1, 10) == 1:
            print(f" {self.nombre} se movió rápido y esquivó!")
            return "ESQUIVADO"

        # El guerrero aprovecha mejor su escudo.
        # Si tiene 10 de escudo, bloquea 10 * 1.5 = 15 puntos.
        bloqueo = self.escudo * 1.5

        # Ejemplo: si recibe 30 y bloquea 15, entonces pierde 15 de vida.
        daño_final = max(0, cantidad - bloqueo)
        
        self.vida = max(0, self.vida - daño_final)
        print(f" {self.nombre} bloquea! Recibió {daño_final} de daño. Vida: {self.vida}")
        
        if self.vida <= 0:
            self.esta_vivo = False
        return daño_final

class Orco(Personaje):
    """
    Subclase Orco: Se vuelve más fuerte con cada ataque (furia).
    """
    def __init__(self, nombre, vida, escudo):
        # super() reutiliza el constructor de Personaje para no repetir código.
        super().__init__(nombre, vida, escudo)
        # La furia hace que el orco pegue más fuerte con el paso de los turnos.
        self.furia = 0

    def atacar(self, objetivo):
        # El daño base del orco es 15.
        # Luego suma 2 puntos extra por cada nivel de furia acumulado.
        daño_base = 15
        daño_total = daño_base + (self.furia * 2)
        
        print(f" {self.nombre} ataca con furia nivel {self.furia}!")

        # Se llama al método recibir_daño del objetivo.
        # Si el objetivo es un Guerrero, usará la versión de Guerrero.
        objetivo.recibir_daño(daño_total)
        
        # Después de atacar, la furia sube 1 punto.
        self.furia += 1

    def recibir_daño(self, cantidad):
        # Si el golpe es muy débil, el orco lo ignora y no pierde vida.
        if cantidad < 5:
            print(f" {self.nombre} no me hace nada jajaja ...")
            return 0
        
        # Si el golpe sí cuenta, usa la lógica general de Personaje.
        return super().recibir_daño(cantidad)

# --- SIMULACIÓN DE LA BATALLA ---

def elegir_accion_jugador(nombre, acciones):
    while True:
        print(f"\n {nombre}, elige tu accion:")
        for i, accion in enumerate(acciones, start=1):
            print(f"  {i}) {accion}")

        eleccion = input(f" Opcion (1-{len(acciones)}) [Enter={acciones[0]}]: ").strip()
        if eleccion == "":
            return acciones[0]

        if eleccion.isdigit():
            idx = int(eleccion)
            if 1 <= idx <= len(acciones):
                return acciones[idx - 1]

        for accion in acciones:
            if eleccion.lower() == accion.lower():
                return accion

        print(" Opcion invalida. Intenta otra vez.")

def iniciar_combate():
    print("=== BIENVENIDO AL COLISEO DE PYTHON ===")

    # Si el usuario no escribe nada y pulsa Enter, el nombre por defecto será Arturo.
    nombre_jugador = input("Dime el nombre de tu Guerrero: ") or "Uhtred de Bebbanburg"
    
    # Creamos los dos personajes con sus estadísticas iniciales.
    jugador = Guerrero(nombre_jugador, 100, 10)
    print(f"¡Bienvenido, guerrero {jugador.nombre}!")
    
    enemigo = Orco("Throll", 120, 5)
    
    
    # Lista de acciones posibles. random.choice() elegirá una al azar.
    acciones = ["Ataque", "Furia", "Magia", "Escudo" if isinstance(jugador, Guerrero) else "Rugido"]
    
    # Para simplificar, definiremos las acciones disponibles para cada uno
    acciones_jugador = ["Ataque", "Furia", "Magia", "Escudo"]
    acciones_enemigo = ["Ataque", "Furia", "Magia", "Rugido"]

    # Aquí se guardan los eventos importantes para mostrarlos al final.
    historial = [] 
    
    print(f"\n--- {jugador.nombre} VS {enemigo.nombre} ---")

    turno = 1 # El combate comienza en el turno 1.

    # El combate sigue mientras ambos vivan y no se pase del turno 15.
    while jugador.esta_vivo and enemigo.esta_vivo and turno <= 15:
        print(f"\n" + "="*30)
        print(f"TURNO {turno}")
        print("="*30)
        
        # --- TURNO DEL GUERRERO ---
        accion_jugador = elegir_accion_jugador(jugador.nombre, acciones_jugador)
        print(f" Acción elegida: ¡{accion_jugador.upper()}!")
        

        if accion_jugador == "Ataque":
            # Ataque normal del jugador: daño aleatorio entre 20 y 30.
            daño = random.randint(20, 30)
            print(f" Ataque de {daño} puntos.")
            res = enemigo.recibir_daño(daño)
            historial.append(f"Turno {turno}: {jugador.nombre} usó Ataque ({res})")
        elif accion_jugador == "Furia":
            # Furia del jugador: más daño que un ataque normal.
            daño = random.randint(40, 50)
            print(f" ¡Furia! Daño de {daño} puntos.")
            res = enemigo.recibir_daño(daño)
            historial.append(f"Turno {turno}: {jugador.nombre} usó FURIA ({res})")
        elif accion_jugador == "Magia":
            # Magia no daña: recupera vida.
            jugador.curar_magia()
            historial.append(f"Turno {turno}: {jugador.nombre} usó MAGIA")
        elif accion_jugador == "Escudo":
            # Escudo: Daño bajo pero aumenta el escudo permanentemente en 2.
            daño = random.randint(10, 15)
            jugador.escudo += 2
            print(f" ¡Embate de Escudo! Daño de {daño} puntos. ¡Escudo aumentado a {jugador.escudo}!")
            res = enemigo.recibir_daño(daño)
            historial.append(f"Turno {turno}: {jugador.nombre} usó ESCUDO (+2 def)")

        # Si el enemigo murió en el turno del jugador, se corta el combate.
        if not enemigo.esta_vivo: break


        # --- TURNO DEL ORCO ---
        print(f"\n Turno de {enemigo.nombre}...")
        accion_enemigo = random.choice(acciones_enemigo)
        
        if accion_enemigo == "Ataque":
            # El orco usa su método atacar(), que depende de la furia acumulada.
            enemigo.atacar(jugador)
            historial.append(f"Turno {turno}: {enemigo.nombre} ATACÓ")
        elif accion_enemigo == "Furia":
            # Esta acción pega fuerte y además suma la furia actual al daño.
            # Ejemplo: si sale 30 y la furia actual es 3, el daño total será 33.
            daño_furia = random.randint(25, 35) + enemigo.furia
            print(f" {enemigo.nombre} golpea con {daño_furia}!")
            jugador.recibir_daño(daño_furia)
            # Después del golpe, la furia también aumenta.
            enemigo.furia += 1
            historial.append(f"Turno {turno}: {enemigo.nombre} usó FURIA")
        elif accion_enemigo == "Magia":
            enemigo.curar_magia()
            historial.append(f"Turno {turno}: {enemigo.nombre} usó MAGIA")
        elif accion_enemigo == "Rugido":
            # Rugido: Aumenta la furia significativamente (+2).
            enemigo.furia += 2
            print(f" ¡{enemigo.nombre} lanza un rugido aterrador! Su furia aumenta considerablemente.")
            historial.append(f"Turno {turno}: {enemigo.nombre} usó RUGIDO (+2 furia)")

        # Estado rápido al final de cada ronda.
        print(f"\n>> STATUS: {jugador.nombre}: {jugador.vida} Vida | {enemigo.nombre}: {enemigo.vida} Vida")
        turno += 1

    print("\n" + "*" * 25)
    print("      FIN DEL DUELO      ")
    print("*" * 25)
    
    # --- RESUMEN FINAL ---
    print("\n HISTORIAL DE LA BATALLA:")
    for evento in historial:
        print(f"  - {evento}")

    # Resultado principal del combate según quién siga con vida.
    if jugador.esta_vivo and not enemigo.esta_vivo:
        print(f"\n ¡VICTORIA PARA {jugador.nombre.upper()}!")
    elif enemigo.esta_vivo and not jugador.esta_vivo:
        print(f"\n {jugador.nombre} ha sido derrotado...")
    else:
        print("\n ¡Empate técnico!")

    print("\n" + "=" * 25)
    print("FIN DE LA BATALLA")

    # Se vuelve a anunciar el ganador con un formato final más visible.
    if jugador.esta_vivo and not enemigo.esta_vivo:
        print(f" ¡EL GANADOR ES {jugador.nombre.upper()}!")
    elif enemigo.esta_vivo and not jugador.esta_vivo:
        print(f" EL GANADOR ES {enemigo.nombre.upper()}...")
    else:
        print(" El combate terminó en un empate técnico.")
    print("=" * 25)

if __name__ == "__main__":
    # Este bloque hace que la batalla solo arranque si el archivo se ejecuta directamente.
    iniciar_combate()
