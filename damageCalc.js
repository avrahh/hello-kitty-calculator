function damageStatEffective(dmgStatPercent) {
  return Math.min(dmgStatPercent, 237);
}

function critChanceFormula(C, B, level) {
  if (3 * C + B === 0) return 0;
  const raw = (3 * C) / (3 * C + B);
  const cap = Math.min(level, 95) / 100;
  return Math.min(raw, cap);
}

function critMultiplierFormula(C, B) {
  if (C + 3 * B === 0) return 2; // default crit multiplier
  return 2 - (3 * B) / (3 * B + C);
}

function calculateDamage() {
  const base = parseFloat(document.getElementById('baseDmg').value) || 0;
  let dmgStat = parseFloat(document.getElementById('dmgStat').value) || 0;

  // Calculate total blade multiplier multiplicatively
  const bladeElements = document.querySelectorAll('.blade');
  let bladeMultiplier = 1;
  bladeElements.forEach(el => {
    const val = parseFloat(el.value) || 0;
    bladeMultiplier *= (1 + val / 100);
  });

  // Calculate total trap multiplier multiplicatively
  const trapElements = document.querySelectorAll('.trap');
  let trapMultiplier = 1;
  trapElements.forEach(el => {
    const val = parseFloat(el.value) || 0;
    trapMultiplier *= (1 + val / 100);
  });

  // Calculate total incoming boost multiplicatively
  const incomingElements = document.querySelectorAll('.incoming');
  let incomingMultiplier = 1;
  incomingElements.forEach(el => {
    const val = parseFloat(el.value) || 0;
    incomingMultiplier *= (1 + val / 100);
  });

  // Calculate total debuff multiplier multiplicatively (debuffs reduce damage)
  const debuffElements = document.querySelectorAll('.debuff');
  let debuffMultiplier = 1;
  debuffElements.forEach(el => {
    const val = parseFloat(el.value) || 0;
    debuffMultiplier *= (1 - val / 100);
  });

  const globalBuffs = parseFloat(document.getElementById('globalBuffs').value) || 0;
  const resist = parseFloat(document.getElementById('enemyResist').value) || 0;
  const pierce = parseFloat(document.getElementById('pierce').value) || 0;
  const shields = parseFloat(document.getElementById('shields').value) || 0;

  const critToggle = document.getElementById('critical').value;
  const C = parseFloat(document.getElementById('critRating').value) || 0;
  const B = parseFloat(document.getElementById('blockRating').value) || 0;
  const level = parseFloat(document.getElementById('level').value) || 1;

  const manualCritMultInput = document.getElementById('manualCritMult').value;
  const manualCritMult = manualCritMultInput ? parseFloat(manualCritMultInput) : null;

  const effectiveDmgStat = damageStatEffective(dmgStat);

  // Base damage without +1 addition (for accuracy)
  const baseDamage = base;

  // Total damage stat and global buffs added
  const totalBuff = (effectiveDmgStat + globalBuffs) / 100;

  // Apply damage stat and global buffs first
  let damage = baseDamage * (1 + totalBuff);

  // Multiply blades and traps (multiplicative stacking)
  damage *= bladeMultiplier;
  damage *= trapMultiplier;

  // Then apply incoming boosts (multiplicative)
  damage *= incomingMultiplier;

  // Then apply debuffs (multiplicative, reduce damage)
  damage *= debuffMultiplier;

  // Calculate crit chance and multiplier
  let critChance = 0;
  let critMult = manualCritMult || critMultiplierFormula(C, B);

  if (critToggle === "yes") {
    critChance = critChanceFormula(C, B, level);
  }

  // Expected damage with crit chance
  let damageAfterCrit = damage * (1 - critChance) + damage * critMult * critChance;

  // Apply resist/pierce/shields (reduce damage)
  const effectiveResist = Math.max(0, resist - pierce) / 100;
  damageAfterCrit *= (1 - effectiveResist);
  damageAfterCrit *= (1 - shields / 100);

  // Round final result
  let finalDamage = Math.round(damageAfterCrit);

  document.getElementById("result").innerText = `Expected Final Damage: ${finalDamage}`;
  document.getElementById("critInfo").innerText =
    (critToggle === "yes")
      ? `Crit Chance: ${(critChance * 100).toFixed(2)}% | Crit Multiplier: ${critMult.toFixed(3)}x`
      : "";
  document.getElementById("statInfo").innerText =
    `Effective Damage Stat (capped at 237%): ${effectiveDmgStat.toFixed(2)}%`;
}
