# ⚔️ Coliseo de Batalla RPG

Simulador de batalla por turnos entre un **Guerrero** y un **Orco**, con:

- `batalla_rpg.py`: versión consola (Python + POO)
- `ui/`: interfaz web medieval interactiva (HTML/CSS/JS)

---

## 📁 Estructura del proyecto

```
Coliseo_Python/
├── batalla_rpg.py
├── README.md
└── ui/
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/
        ├── background.png
        ├── warrior.jpg
        ├── warrior.png
        ├── orc.jpg
        └── orc.png
```

---

## 🐍 Versión consola (Python)

### Requisitos
- Python 3.x

### Ejecutar
```bash
python batalla_rpg.py
```

### Mecánicas (consola)
- Acciones del jugador: **Ataque**, **Furia**, **Magia**
- Daño del jugador:
  - **Ataque**: 20–30
  - **Furia**: 40–50
  - **Magia**: cura 10–20
- Defensa / esquiva:
  - **Guerrero**: 10% de esquiva; su escudo bloquea `escudo × 1.5`
  - **Orco**: puede esquivar (probabilidad base ~14%); su escudo resta daño de forma normal
- Orco y furia:
  - **Ataque**: `15 + (furia × 2)` y luego `furia += 1`
  - **Furia**: `(25–35) + furia` y luego `furia += 1`
- Límite de combate: **10 turnos** (si nadie cae, empate)

### POO aplicada (consola)
| Concepto | Implementación |
|----------|----------------|
| Clases | `Personaje`, `Guerrero`, `Orco` |
| Herencia | `Guerrero` y `Orco` heredan de `Personaje` |
| Polimorfismo | `recibir_daño()` cambia según la clase |
| Encapsulamiento | atributos y métodos por clase |
| Estado especial | `furia` del Orco escala el daño |

---

## 🌐 Interfaz web

### Requisitos
- Python 3.x (para levantar servidor local)
- Navegador moderno (Chrome/Edge/Firefox)

### Ejecutar
```bash
python -m http.server 8080 --directory ui
```

Luego abre:
```
http://localhost:8080
```

### Mecánicas (web)
La web está implementada en `ui/script.js` y puede diferir de la consola:

- Acciones del jugador: **Ataque**, **Furia**, **Magia**
- Daño del jugador:
  - **Ataque**: 18–28
  - **Furia**: 30–45
  - **Magia**: cura 10–20
- Defensa / esquiva:
  - **Guerrero**: 10% de esquiva; bloqueo `escudo × 1.5`
  - **Orco**: 10% de esquiva; bloqueo `escudo` (sin multiplicador)
- Orco y furia:
  - **Ataque**: `15 + (furia × 2)` y luego `furia += 1`
  - **Furia**: `(25–35) + furia` y luego `furia += 1`
- Límite de combate: **15 turnos** (si nadie cae, empate)

---

## ✨ Características de la interfaz
- Pantalla de presentación con transición animada
- Overlay de turno con retrato del combatiente
- Barras de vida dinámicas (cambian de color al bajar la vida)
- Animación de impacto al recibir daño y efecto al curar
- Crónica de batalla en tiempo real
- Pantalla final con victoria / derrota / empate e historial

---

## 👩‍💻 Tecnologías
- Python 3 (POO + servidor HTTP local)
- HTML5 / CSS3 / JavaScript (interfaz web)
