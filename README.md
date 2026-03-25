# ⚔️ Coliseo de Batalla RPG

Simulador de batalla por turnos entre un **Guerrero** y el Orco **Thrall**, desarrollado con Python (lógica OOP) y una interfaz web medieval interactiva.

---

## 📁 Estructura del proyecto

```
batalla-oop/
├── batalla_rpg.py          # Versión consola (Python + POO)
├── README.md
└── ui/                     # Interfaz web
    ├── index.html          # Estructura HTML (3 pantallas)
    ├── style.css           # Diseño medieval oscuro
    ├── script.js           # Lógica del juego en JavaScript
    └── assets/
        ├── background.png  # Fondo de batalla medieval
        ├── warrior.jpg     # Retrato del Guerrero
        └── orc.jpg         # Retrato de Thrall
```

---

## 🐍 Versión consola (Python)

### Requisitos
- Python 3.x

### Ejecutar
```bash
python batalla_rpg.py
```

### Conceptos de POO aplicados
| Concepto | Implementación |
|----------|---------------|
| **Clases** | `Personaje`, `Guerrero`, `Orco` |
| **Herencia** | `Guerrero` y `Orco` heredan de `Personaje` |
| **Polimorfismo** | `recibir_daño()` se comporta distinto en cada clase |
| **Encapsulamiento** | Atributos y métodos propios por clase |
| **Atributo especial** | `furia` del Orco aumenta su daño por turno |

---

## 🌐 Interfaz Web

### Requisitos
- Python 3.x (para el servidor local)
- Navegador moderno (Chrome, Edge, Firefox)

### Ejecutar paso a paso

**1. Abre una terminal en la carpeta del proyecto**

**2. Lanza el servidor local:**
```bash
python -m http.server 8080 --directory "ui"
```

**3. Abre el navegador y ve a:**
```
http://localhost:8080
```

**4. ¡A jugar!** Escribe el nombre de tu guerrero y pulsa ⚔️ COMENZAR BATALLA.

> ⚠️ Mantén la terminal abierta mientras juegas.

---

## 🎮 Mecánicas del juego

| Acción | Efecto |
|--------|--------|
| ⚔️ **Ataque** | Inflige 18–28 puntos de daño |
| 🔥 **Furia** | Inflige 30–45 puntos de daño |
| ✨ **Magia** | Cura al personaje entre 10–20 HP |
| 🛡️ **Escudo** | Reduce el daño recibido |
| 💨 **Esquivar** | 10% de probabilidad de evitar el daño |

### Personajes
- **Guerrero** — 100 HP · Escudo 10 · Bloqueo reforzado (×1.5)
- **Thrall (Orco)** — 120 HP · Escudo 5 · Furia acumulativa (+2 daño/turno)

La batalla dura un máximo de **15 turnos**. Si ninguno cae, se declara empate.

---

## ✨ Características de la interfaz

- Pantalla de presentación con transición animada de los personajes
- Overlay de turno: cada vez que cambia el turno aparece el retrato del combatiente
- Barras de vida dinámicas (cambian de color al bajar la vida)
- Animación de temblor al recibir daño
- Crónica de batalla en tiempo real
- Pantalla de victoria / derrota / empate con historial completo

---

## 👩‍💻 Tecnologías

- **Python 3** — Lógica OOP y servidor HTTP
- **HTML5 / CSS3 / JavaScript** — Interfaz web
- **Google Fonts** — Tipografía medieval (Cinzel, Crimson Text)
