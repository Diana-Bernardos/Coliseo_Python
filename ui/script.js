// =====================================================
//  RPG BATTLE GAME LOGIC - Coliseo de Batalla
//  Port of batalla_rpg.py to JavaScript
// =====================================================

// --- GAME STATE ---
// STATE concentra toda la informacion mutable de la partida.
// La interfaz no "piensa" por si sola: siempre refleja lo que hay aqui.
const STATE = {
  playerName: 'Guerrero',
  playerHP: 100,
  playerMaxHP: 100,
  playerShield: 10,
  playerAlive: true,
  orcHP: 120,
  orcMaxHP: 120,
  orcShield: 5,
  orcAlive: true,
  // La furia del orco aumenta el dano de sus ataques posteriores.
  orcFury: 0,
  turn: 1,
  maxTurns: 15,
  // Guarda un resumen breve de cada turno para la pantalla final.
  historial: [],
  // Impide que el usuario pulse varias acciones mientras se resuelve el turno.
  busy: false,
};

// --- Utility ---
// Entero aleatorio entre min y max, ambos incluidos.
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pausa artificial para dar ritmo a turnos, overlays y animaciones.
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// --- DOM helpers ---
// Atajo para buscar elementos por id sin repetir mucho codigo.
const $ = id => document.getElementById(id);

// =====================================================
//  INTRO SCREEN
// =====================================================
function startGame() {
  // Usa el nombre del input si existe; si no, asigna uno por defecto.
  const nameInput = $('player-name').value.trim();
  STATE.playerName = nameInput
    ? nameInput.charAt(0).toUpperCase() + nameInput.slice(1)
    : 'Uthred';

  // Refleja el nombre y reinicia el contador visual del turno.
  $('warrior-name').textContent = STATE.playerName.toUpperCase();
  $('turn-number').textContent = '1';

  // Cambia de la pantalla inicial a la pantalla de batalla.
  $('intro-screen').classList.remove('active');
  $('battle-screen').classList.add('active');

  // Un pequeño retraso hace mas suave la entrada al primer turno.
  setTimeout(() => showTurnOverlay('warrior'), 400);
}

// =====================================================
//  TURN OVERLAY TRANSITIONS
// =====================================================
async function showTurnOverlay(who) {
  const overlay = $('turn-overlay');
  const img = $('turn-portrait-img');
  const text = $('turn-text');

  // Hace visible el anuncio de turno.
  overlay.classList.remove('hidden');

  if (who === 'warrior') {
    img.src = 'assets/warrior.jpg';
    text.textContent = `⚔️ TURNO DE ${STATE.playerName.toUpperCase()}`;
    text.className = 'turn-text warrior-text';

    // Marca visualmente al guerrero como personaje activo.
    $('portrait-warrior').classList.add('active-turn');
    $('portrait-orc').classList.remove('active-turn');
  } else {
    img.src = 'assets/orc.jpg';
    text.textContent = '🔥 TURNO DE THRALL';
    text.className = 'turn-text orc-text';

    // Marca visualmente al orco como personaje activo.
    $('portrait-orc').classList.add('active-turn');
    $('portrait-warrior').classList.remove('active-turn');
  }

  // El cartel dura un momento y luego desaparece para continuar la accion.
  await sleep(1600);
  overlay.classList.add('hidden');
}

// =====================================================
//  BATTLE LOG
// =====================================================
function addLog(message, type = '') {
  // Cada evento importante genera una entrada nueva en la cronica de batalla.
  const log = $('battle-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  log.appendChild(entry);

  // Mantiene visible siempre la linea mas reciente.
  log.scrollTop = log.scrollHeight;
}

// =====================================================
//  Vida BAR UPDATES
// =====================================================
function updateHP() {
  // Calcula el porcentaje de vida del guerrero y actualiza su barra.
  const wPct = Math.max(0, (STATE.playerHP / STATE.playerMaxHP) * 100);
  const wBar = $('warrior-hp-bar');
  wBar.style.width = wPct + '%';
  $('warrior-hp-value').textContent = `${Math.max(0, STATE.playerHP)} / ${STATE.playerMaxHP}`;
  wBar.classList.remove('danger', 'warning');
  if (wPct <= 25) wBar.classList.add('danger');
  else if (wPct <= 50) wBar.classList.add('warning');

  // Repite la misma logica para el orco.
  const oPct = Math.max(0, (STATE.orcHP / STATE.orcMaxHP) * 100);
  const oBar = $('orc-hp-bar');
  oBar.style.width = oPct + '%';
  $('orc-hp-value').textContent = `${Math.max(0, STATE.orcHP)} / ${STATE.orcMaxHP}`;
  oBar.classList.remove('danger', 'warning');
  if (oPct <= 25) oBar.classList.add('danger');
  else if (oPct <= 50) oBar.classList.add('warning');

  // La furia del orco tambien se muestra porque afecta al dano futuro.
  $('orc-fury').textContent = STATE.orcFury;
}

// =====================================================
//  DAMAGE & HEAL ANIMATIONS
// =====================================================
function shakeCard(who) {
  // Elige la carta correcta segun quien reciba el golpe.
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  card.classList.remove('shake');

  // Fuerza un reflow para reiniciar la animacion si se dispara seguida.
  void card.offsetWidth;

  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

function healEffect(who) {
  // Misma idea que shakeCard, pero para resaltar una curacion.
  const card = who === 'warrior' ? $('card-warrior') : $('card-orc');
  card.classList.remove('heal-flash');
  void card.offsetWidth;
  card.classList.add('heal-flash');
  setTimeout(() => card.classList.remove('heal-flash'), 600);
}

// =====================================================
//  CORE MECHANICS (mirrored from Python)
// =====================================================

// El guerrero recibe dano aplicando esta secuencia:
// 1. puede esquivar del todo,
// 2. si no esquiva, su escudo reduce 1.5x su valor,
// 3. se actualiza la vida y se comprueba derrota.
function warriorReceiveDamage(amount) {
  // 10% de probabilidad de esquiva total.
  if (rand(1, 10) === 1) {
    addLog(`✦ ${STATE.playerName} se movió rápido y esquivó completamente!`, 'dodge');
    return 'ESQUIVADO';
  }

  const block = STATE.playerShield * 1.5;
  const finalDmg = Math.max(0, amount - block);
  STATE.playerHP = Math.max(0, STATE.playerHP - finalDmg);

  shakeCard('warrior');
  addLog(`→ ${STATE.playerName} bloqueó parcialmente. Recibió ${finalDmg} daño. Vida: ${STATE.playerHP}`, 'damage');

  if (STATE.playerHP <= 0) {
    STATE.playerAlive = false;
    addLog(`!!! ${STATE.playerName} ha caído en combate !!!`, 'death');
  }

  // Se devuelve para dejar constancia en el historial del turno.
  return finalDmg;
}

// El orco recibe dano con reglas ligeramente distintas:
// 1. ignora golpes demasiado pequenos,
// 2. puede esquivar,
// 3. su escudo reduce el dano base sin multiplicador.
function orcReceiveDamage(amount) {
  if (amount < 5) {
    addLog(`Thrall ni lo sintió...`, 'action-orc');
    return 0;
  }

  // 10% de esquiva, igual que el jugador.
  if (rand(1, 10) === 1) {
    addLog(`✦ Thrall ha esquivado el ataque completamente!`, 'dodge');
    return 'ESQUIVADO';
  }

  const finalDmg = Math.max(0, amount - STATE.orcShield);
  STATE.orcHP = Math.max(0, STATE.orcHP - finalDmg);

  shakeCard('orc');
  addLog(`→ Thrall recibió ${finalDmg} de daño. Vida: ${STATE.orcHP}`, 'damage');

  if (STATE.orcHP <= 0) {
    STATE.orcAlive = false;
    addLog(`!!! Thrall ha caído en combate !!!`, 'death');
  }

  return finalDmg;
}

function curaMagia(who) {
  // Curacion variable para que no siempre tenga el mismo impacto.
  const pocion = rand(10, 20);

  if (who === 'warrior') {
    STATE.playerHP += pocion;
    healEffect('warrior');
    addLog(`✨ ${STATE.playerName} usa magia y recupera ${pocion} de vida! (Vida: ${STATE.playerHP})`, 'heal');
  } else {
    STATE.orcHP += pocion;
    healEffect('orc');
    addLog(`✨ Thrall ruge y se regenera! +${pocion} vida (Vida: ${STATE.orcHP})`, 'heal');
  }
}

// =====================================================
//  PLAYER ACTION (called from buttons)
// =====================================================
async function playerAction(action) {
  // Si el turno sigue en curso o ya hay un vencedor, ignoramos la accion.
  if (STATE.busy || !STATE.playerAlive || !STATE.orcAlive) return;
  STATE.busy = true;

  // Bloquea la UI para evitar dobles clics mientras se resuelve el turno entero.
  setActionButtons(false);

  // Inserta una cabecera visual para separar turnos en el log.
  addLog(`══ TURNO ${STATE.turn} ══`, 'turn-header');

  // --- Accion del jugador ---
  // Segun la accion elegida, el jugador ataca, usa furia o se cura.
  if (action === 'attack') {
    const dmg = rand(18, 28);
    addLog(`⚔️ ${STATE.playerName} lanza un Tajo con ${dmg} de daño!`, 'action-player');
    const res = orcReceiveDamage(dmg);
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Ataque (${res})`);
  } else if (action === 'fury') {
    const dmg = rand(30, 45);
    addLog(`🔥 ¡FURIA! ${STATE.playerName} embiste con ${dmg} de daño!`, 'action-player');
    const res = orcReceiveDamage(dmg);
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} FURIA (${res})`);
  } else if (action === 'magic') {
    addLog(`✨ ${STATE.playerName} invoca magia curativa!`, 'action-player');
    curaMagia('warrior');
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Magia`);
  } else if (action === 'shield') {
    const dmg = rand(10, 15);
    STATE.playerShield += 2;
    addLog(`🛡️ ¡Embate de Escudo! ${STATE.playerName} golpea con ${dmg} de daño. ¡Escudo aumentado!`, 'action-player');
    const res = orcReceiveDamage(dmg);
    $('warrior-shield').textContent = STATE.playerShield;
    STATE.historial.push(`T${STATE.turn}: ${STATE.playerName} Escudo (+2 def)`);
  }

  updateHP();

  // Si el jugador gana aqui, se corta el flujo antes de ejecutar al orco.
  if (!STATE.orcAlive) {
    await sleep(800);
    endGame('warrior');
    return;
  }

  // --- Turno del orco ---
  // El panel de espera hace evidente que ahora actua la IA.
  showWaiting(true);
  await sleep(1200);

  await showTurnOverlay('orc');
  showWaiting(false);

  // IA simple: elige aleatoriamente una accion.
  const actions = ['attack', 'fury', 'magic', 'roar'];
  const orcAction = actions[rand(0, 3)];

  if (orcAction === 'attack') {
    // Su ataque base escala con la furia acumulada de turnos anteriores.
    const dmgBase = 15;
    const dmgTotal = dmgBase + STATE.orcFury * 2;
    addLog(`🟢 Thrall ataca con Furia nivel ${STATE.orcFury}! (${dmgTotal} daño)`, 'action-orc');
    warriorReceiveDamage(dmgTotal);
    STATE.orcFury += 1;
    $('orc-fury').textContent = STATE.orcFury;
    STATE.historial.push(`T${STATE.turn}: Thrall Ataque`);
  } else if (orcAction === 'fury') {
    // La habilidad de furia pega mas fuerte y tambien hace crecer su furia.
    const dmgFuria = rand(25, 35) + STATE.orcFury;
    addLog(`🔥 ¡Thrall golpea con FURIA! ${dmgFuria} daño!`, 'action-orc');
    warriorReceiveDamage(dmgFuria);
    STATE.orcFury += 1;
    $('orc-fury').textContent = STATE.orcFury;
    STATE.historial.push(`T${STATE.turn}: Thrall FURIA`);
  } else if (orcAction === 'magic') {
    // Si elige magia, renuncia a danar ese turno a cambio de recuperar vida.
    addLog(`🟢 Thrall ruge y recupera energía...`, 'action-orc');
    curaMagia('orc');
    STATE.historial.push(`T${STATE.turn}: Thrall Magia`);
  } else if (orcAction === 'roar') {
    STATE.orcFury += 2;
    addLog(`🟢 ¡Rugido Aterrador! Thrall se enfurece. (+2 Furia)`, 'action-orc');
    $('orc-fury').textContent = STATE.orcFury;
    STATE.historial.push(`T${STATE.turn}: Thrall Rugido (+2 furia)`);
  }

  updateHP();

  // Si el orco mata al jugador durante su respuesta, termina la batalla.
  if (!STATE.playerAlive) {
    await sleep(800);
    endGame('orc');
    return;
  }

  // Si nadie ha caido, se avanza al siguiente turno.
  STATE.turn++;
  $('turn-number').textContent = Math.min(STATE.turn, STATE.maxTurns);

  // El limite de turnos evita combates infinitos y provoca empate.
  if (STATE.turn > STATE.maxTurns) {
    await sleep(600);
    endGame('draw');
    return;
  }

  // Anuncia de nuevo el turno del jugador y reactiva la interfaz.
  await showTurnOverlay('warrior');

  STATE.busy = false;
  setActionButtons(true);
}

// =====================================================
//  UI HELPERS
// =====================================================
function setActionButtons(enabled) {
  // Habilita o deshabilita todos los botones del panel de acciones.
  ['btn-attack', 'btn-fury', 'btn-magic', 'btn-shield'].forEach(id => {
    $(id).disabled = !enabled;
  });

  // Tambien oculta el panel cuando no toca actuar al jugador.
  $('action-panel').style.display = enabled ? 'block' : 'none';
}

function showWaiting(show) {
  // Este panel aparece mientras el jugador espera la accion del orco.
  $('waiting-panel').classList.toggle('hidden', !show);
}

// =====================================================
//  END GAME
// =====================================================
function endGame(winner) {
  // Prepara los elementos de la pantalla final.
  const endPortrait = $('result-portrait');
  const resultTitle = $('result-title');
  const resultSub = $('result-subtitle');
  const endLog = $('end-log');

  if (winner === 'warrior') {
    endPortrait.innerHTML = `<img src="assets/warrior.jpg" alt="Guerrero Victorioso"/>`;
    resultTitle.textContent = `⚔️ ¡VICTORIA!`;
    resultSub.textContent = `¡${STATE.playerName} ha derrotado a Thrall!`;
  } else if (winner === 'orc') {
    endPortrait.innerHTML = `<img src="assets/orc.jpg" alt="Thrall Victorioso"/>`;
    resultTitle.textContent = `💀 DERROTA`;
    resultSub.textContent = `${STATE.playerName} ha sido vencido por Thrall...`;
  } else {
    endPortrait.innerHTML = `<img src="assets/background.png" alt="Empate"/>`;
    resultTitle.textContent = `⚖️ EMPATE`;
    resultSub.textContent = `El combate terminó sin un vencedor...`;
  }

  // Copia el historial resumido del combate en la cronica final.
  STATE.historial.forEach(evt => {
    const p = document.createElement('p');
    p.textContent = `• ${evt}`;
    endLog.appendChild(p);
  });

  // Cambia de la arena a la pantalla de resultado.
  $('battle-screen').classList.remove('active');
  $('end-screen').classList.add('active');
}

// =====================================================
//  RESTART
// =====================================================
function restartGame() {
  // Restaura el estado interno del juego a sus valores iniciales.
  Object.assign(STATE, {
    playerName: 'Guerrero',
    playerHP: 100,
    playerMaxHP: 100,
    playerShield: 10,
    playerAlive: true,
    orcHP: 120,
    orcMaxHP: 120,
    orcShield: 5,
    orcAlive: true,
    orcFury: 0,
    turn: 1,
    historial: [],
    busy: false,
  });

  // Limpia la informacion visual de la partida anterior.
  $('battle-log').innerHTML = '';
  $('end-log').innerHTML = '';
  $('player-name').value = '';
  $('turn-number').textContent = '1';

  // Reinicia barras, textos y contadores mostrados en pantalla.
  $('warrior-hp-bar').style.width = '100%';
  $('warrior-hp-value').textContent = '100 / 100';
  $('orc-hp-bar').style.width = '100%';
  $('orc-hp-value').textContent = '120 / 120';
  $('orc-fury').textContent = '0';

  // Elimina estados visuales residuales de la batalla anterior.
  $('card-warrior').classList.remove('defeated');
  $('card-orc').classList.remove('defeated');
  $('portrait-warrior').classList.remove('active-turn');
  $('portrait-orc').classList.remove('active-turn');

  // Devuelve los paneles interactivos a su estado normal.
  $('action-panel').style.display = 'block';
  setActionButtons(true);
  showWaiting(false);

  // Regresa a la pantalla de introduccion para iniciar otra partida.
  $('end-screen').classList.remove('active');
  $('battle-screen').classList.remove('active');
  $('intro-screen').classList.add('active');
}
