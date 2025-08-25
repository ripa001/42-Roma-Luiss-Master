# 💰 Sistema di Ricompense per Validatori - Trick42 Token

## 📋 Panoramica

Il progetto Trick42 Token ha implementato un sistema completo di ricompense per incentivare i validatori a partecipare attivamente alla piattaforma e mantenere alta la qualità delle validazioni.

## 🎯 Obiettivi del Sistema di Ricompense

1. **Incentivare la partecipazione** - Attirare più validatori sulla piattaforma
2. **Premiare la qualità** - Ricompensare validatori con alta reputazione
3. **Promuovere l'attività** - Bonus per validatori più attivi
4. **Garantire la sostenibilità** - Sistema economico bilanciato

## 💎 Tipi di Ricompense

### 1. 📊 Commissioni di Validazione
- **Base**: 10% del reward mintato per lo skater
- **Esempio**: Trick difficoltà 10 = 50 T42 allo skater + 5 T42 al validatore

### 2. 🏆 Bonus Reputazione
- **Requisito**: Reputazione ≥ 150
- **Bonus**: +5% aggiuntivo sulla validazione
- **Esempio**: 10% base + 5% bonus = 15% di commissione

### 3. ⚡ Bonus Attività
- **Requisito**: ≥10 validazioni nella settimana corrente
- **Bonus**: +3% aggiuntivo sulla validazione
- **Reset**: Automatico ogni settimana

### 4. 🎁 Pool di Ricompense Settimanali
- **Pool**: 1000 T42 distribuiti ogni settimana
- **Distribuzione**: Proporzionale all'attività di ogni validatore
- **Claim**: I validatori devono reclamare manualmente le ricompense

## 🏦 Sistema di Staking per Validatori

### Requisiti di Staking
- **Minimo**: 100 T42 per diventare validatore
- **Meccanismo**: Staking diretto dei token
- **Unstaking**: Rimozione automatica dello status di validatore se sotto la soglia

### Funzioni Principali
```solidity
// Diventare validatore tramite staking
function stakeToValidator(uint256 amount) external

// Fare unstaking e perdere status validatore
function unstakeValidator(uint256 amount) external
```

## 📈 Calcolo delle Ricompense

### Formula di Base
```javascript
CommissioneValidatore = BaseReward × (10% + BonusReputazione + BonusAttività) / 100

// Dove:
// BaseReward = reward mintato per lo skater
// BonusReputazione = 5% se reputazione ≥ 150
// BonusAttività = 3% se validazioni settimanali ≥ 10
```

### Esempi Pratici

#### Validatore Normale
- Trick difficoltà 8 → 40 T42 allo skater
- Commissione: 40 × 10% = 4 T42

#### Validatore Alta Reputazione (Rep: 200)
- Trick difficoltà 8 → 40 T42 allo skater  
- Commissione: 40 × 15% = 6 T42

#### Validatore Super Attivo (Rep: 200, 15 validazioni/settimana)
- Trick difficoltà 8 → 40 T42 allo skater
- Commissione: 40 × 18% = 7.2 T42

## 🔄 Distribuzione Settimanale

### Meccanismo
1. **Pool**: 1000 T42 accumulati ogni settimana
2. **Admin**: Triggera la distribuzione settimanale
3. **Calcolo**: Proporzionale all'attività di ogni validatore
4. **Claim**: Validatori reclamano individualmente

### Esempio di Distribuzione
- Validatore A: 20 validazioni → 20/50 × 1000 = 400 T42
- Validatore B: 15 validazioni → 15/50 × 1000 = 300 T42  
- Validatore C: 15 validazioni → 15/50 × 1000 = 300 T42

## 🛠️ Funzioni del Smart Contract

### Per i Validatori
```solidity
// Staking
stakeToValidator(uint256 amount)
unstakeValidator(uint256 amount)

// Claim ricompense
claimRewards()

// Info validatore
getValidatorRewards(address validator) → (totalEarned, pendingReward, stakedAmount, weeklyValidations)
```

### Per gli Admin
```solidity
// Distribuzione settimanale
distributeWeeklyRewards()

// Gestione reputazione
updateValidatorReputation(address validator, uint256 reputation)
```

### Funzioni di Utilità
```solidity
// Lista validatori attivi
getActiveValidators() → address[]

// Statistiche pool ricompense
getRewardPoolStats() → (totalPool, lastDistribution, nextDistribution)

// Classifica validatori
getValidatorLeaderboard(uint256 limit) → (validators, validations, earnings, reputations)
```

## 💡 Strategia per Massimizzare le Ricompense

### 1. 🎯 Costruisci la Reputazione
- Inizia con validazioni di qualità
- Mantieni coerenza nelle valutazioni
- Evita conflitti o errori

### 2. ⚡ Mantieni l'Attività
- Punta a ≥10 validazioni/settimana per il bonus attività
- Distribuisci le validazioni nel tempo
- Partecipa regolarmente

### 3. 💰 Ottimizza il Timing
- Fai claim delle ricompense settimanali
- Monitora la tua posizione nella classifica
- Pianifica lo staking in base alle tue risorse

### 4. 🤝 Collabora con la Community
- Partecipa alle discussioni
- Aiuta a mantenere alta la qualità
- Condividi feedback costruttivi

## 📊 Monitoraggio delle Performance

### Metriche Chiave per Validatori
- **Total Earned**: Totale guadagnato lifetime
- **Weekly Validations**: Validazioni nella settimana corrente
- **Reputation Score**: Punteggio reputazione (0-1000)
- **Staked Amount**: Quantità di token in staking
- **Pending Rewards**: Ricompense da reclamare

### Dashboard Consigliata
```javascript
// Esempio di query per dashboard validatore
const validatorInfo = await trick42Token.getValidatorInfo(validatorAddress);
const rewards = await trick42Token.getValidatorRewards(validatorAddress);
const poolStats = await trick42Token.getRewardPoolStats();

console.log({
  isActive: validatorInfo.isActive,
  reputation: validatorInfo.reputation,
  totalValidations: validatorInfo.totalValidations,
  weeklyValidations: rewards.weeklyValidations,
  totalEarned: ethers.formatEther(rewards.totalEarned),
  pendingReward: ethers.formatEther(rewards.pendingReward),
  stakedAmount: ethers.formatEther(rewards.stakedAmount),
  nextDistribution: new Date(poolStats.nextDistribution * 1000)
});
```

## 🚀 Roadmap Futura

### Fase 1 (Completata) ✅
- [x] Sistema base di commissioni
- [x] Bonus reputazione e attività
- [x] Pool ricompense settimanali
- [x] Sistema di staking

### Fase 2 (Pianificata) 🔄
- [ ] NFT speciali per top validatori
- [ ] Sistema di delegazione
- [ ] Ricompense per feedback di qualità
- [ ] Integrazione con governance token

### Fase 3 (Visione) 🌟
- [ ] Validatori specializzati per tipo di trick
- [ ] Seasonal rewards e competizioni
- [ ] Cross-chain validation rewards
- [ ] AI-assisted validation bonuses

## 🔐 Sicurezza e Considerazioni

### Limiti e Protezioni
- **Daily Mint Limit**: 1000 T42 per validatore al giorno
- **Max Supply**: 42M T42 totali
- **Cooldown**: 5 minuti tra validazioni
- **Access Control**: Solo admin possono triggare distribuzioni settimanali

### Best Practices
1. **Backup delle chiavi private** - Essenziale per l'accesso ai rewards
2. **Monitoring regolare** - Controlla le tue metriche settimanalmente
3. **Diversificazione** - Non concentrare tutto lo staking in un singolo validatore
4. **Community engagement** - Partecipa attivamente per mantenere alta la reputazione

## 📞 Supporto e Community

### Risorse Utili
- **Documentazione Tecnica**: `/contracts/SKATE42Token.sol`
- **Test Suite**: `/test/ValidatorRewards.test.js`
- **Deployment Guide**: `/scripts/deploy.js`

### Community Links
- **Discord**: [Coming Soon]
- **Telegram**: [Coming Soon]  
- **Forum**: [Coming Soon]

---

## 🎉 Conclusione

Il sistema di ricompense per validatori di Trick42 Token rappresenta un approccio innovativo per incentivare la partecipazione di qualità in una piattaforma blockchain per skateboard. 

**Vantaggi principali:**
- ✅ **Sostenibilità economica** - Modello tokenomics bilanciato
- ✅ **Incentivi allineati** - Premia qualità e attività
- ✅ **Flessibilità** - Adattabile a diverse tipologie di validatori
- ✅ **Trasparenza** - Tutto tracciabile on-chain
- ✅ **Crescita scalabile** - Supporta l'espansione della community

**Per iniziare come validatore:**
1. Ottieni almeno 100 T42 tokens
2. Chiama `stakeToValidator(amount)`
3. Inizia a validare trick di qualità
4. Monitora le tue performance
5. Reclama le ricompense settimanali

Il sistema è attivo e pronto per rendere la validazione dei trick non solo un'attività di community, ma anche un'opportunità di guadagno per chi contribuisce con qualità e costanza! 🛹💎
