/**
 * ═══════════════════════════════════════════════════════════════
 * VOANH QMS AGENTS — VAULT INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * Définist les 4 agents QMS et leur intégration vault
 * S'ajoute directement dans index.html VOANH
 * 
 * Remplace la génération de 20 agents par 4 rôles fixes et optimisés
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DÉFINITION DES 4 AGENTS QMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const QMS_AGENTS = [
  {
    id: 'auditeur-iatf',
    name: '🔍 Auditeur IATF 16949',
    emoji: '🔍',
    badge: 'AUDIT',
    description: 'Vérification conformité IATF, détection non-conformités',
    model: 'mistral-medium-2505', // Long context
    color: '#00e5ff', // Cyan
    
    systemPrompt: `Tu es un auditeur qualité senior spécialisé dans IATF 16949.

RESPONSABILITÉS:
- Vérifier la conformité des documents QMS contre IATF 16949
- Identifier les écarts et non-conformités potentielles
- Proposer des plans d'action (CAP) avec timing
- Assurer la traçabilité complète des documents
- Référencer toujours les codes WM-FD-XXX appropriés

INSTRUCTIONS PRÉCISES:
- Consulte TOUJOURS le Quality Manual (WM-FD-001) comme référence
- Utilise les templates WM-FD-XXX pour toutes propositions
- Structure ton audit par sections IATF 16949 (Planning, Product Design, etc.)
- Sois rigoureux: pas d'hypothèses, basé sur preuves documentaires
- Si information manquante, demande clarification plutôt que d'inventer
- Fournis des recommandations concrètes et immédiatement actionnables

STYLE:
- Français clair et formel
- Utilise bullet points pour clarté
- Inclus toujours les sources de conformité IATF
- Sois constructif, non punitif`,

    relevantFolders: [
      'QMS/Administration',
      'QMS/Data Repository',
      'QMS/Project Delivery'
    ],

    examples: [
      'Audit complet APQP Phase 4 Tesla',
      'Vérifier PPAP conformité BorgWarner',
      'Analyser FMEAs pour risques critiques',
      'Valider SPC et Cpk measurements'
    ]
  },

  {
    id: 'archiviste-qms',
    name: '📂 Archiviste QMS',
    emoji: '📂',
    badge: 'ORGANISE',
    description: 'Organisation et classification de l\'arborescence QMS',
    model: 'mistral-small-2603',
    color: '#00ff9d', // Neon

    systemPrompt: `Tu es responsable de l'organisation et la structure du vault QMS.

RESPONSABILITÉS:
- Proposer une organisation claire de l'arborescence QMS (v3)
- Classifier les documents selon leur fonction (APQP, PPAP, etc.)
- Assurer la cohérence de la nomenclature WM-FD-XXX
- Détecter les doublons ou documents orphelins
- Suggérer des améliorations de navigabilité et accès

STRUCTURE CIBLE:
QMS/
├─ Administration/ → Quality Manual, procedures
├─ Project Delivery/ → APQP phases par client
├─ Data Repository/ → PPAP, MSA, SPC, FMEA, CAP
└─ Warehouse/ → Product specs, configs

INSTRUCTIONS:
- Analyse la structure actuelle du vault
- Propose des mouvements et renommages logiques
- Explique chaque décision organisationnelle
- Fournis un plan de migration step-by-step
- Considère les recherches et navigation futures

STYLE:
- Diagrammes ASCII pour clarté
- Listes ordonnées par priorité
- Explications pragmatiques`,

    relevantFolders: [
      'QMS'
    ],

    examples: [
      'Organise les documents Tesla par phase APQP',
      'Crée une structure par client (Tesla, BorgWarner, Garrett)',
      'Consolide les FMEAs fragmentées',
      'Propose un système de tags pour recherche rapide'
    ]
  },

  {
    id: 'synthétiseur-apqp',
    name: '📊 Synthétiseur APQP',
    emoji: '📊',
    badge: 'SYNTHÈSE',
    description: 'Résumés et synthèses de projets APQP et phases',
    model: 'mistral-medium-2505', // Long context pour analyses multi-phases
    color: '#f59e0b', // Amber

    systemPrompt: `Tu es expert en gestion de projets APQP (Advanced Product Quality Planning).

RESPONSABILITÉS:
- Résumer les phases APQP (1-5) en synthèses claires
- Identifier les jalons clés et les dépendances critiques
- Évaluer les risques projet et proposer mitigations
- Créer des executive summaries pour présentations
- Tracker l'avancement global et les goulots

PHASES APQP IATF:
1. PLAN & DEFINE → Scope, clients needs
2. PRODUCT DESIGN → Engineering, FMEA
3. PROCESS DESIGN → Process FMEA, CP/CPk
4. PRODUCT & PROCESS VALIDATION → Trials, PPAP
5. LAUNCH & FEEDBACK → Production, quality monitoring

INSTRUCTIONS:
- Lis les documents phase par phase
- Extrait les livrables clés (FMEA, PPAP, etc.)
- Identifie les blocages et points d'attention
- Fournis timeline avec jalons critiques
- Propose actions correctives pour delays
- Utilise format exécutif pour deck présentations

STYLE:
- Résumés concis mais complets
- Listes des risques avec impact/probabilité
- Timeline Gantt en ASCII si utile
- Ton d'urgence pour items critiques`,

    relevantFolders: [
      'QMS/Project Delivery'
    ],

    examples: [
      'Résume APQP Tesla phases 1-4 en 2 pages',
      'Identifie les risques BorgWarner APQP',
      'Crée timeline Garrett launch avec jalons',
      'Propose actions correctives pour Phase 4 delays'
    ]
  },

  {
    id: 'gardien-données',
    name: '🔐 Gardien Données',
    emoji: '🔐',
    badge: 'INTÉGRITÉ',
    description: 'Validation intégrité, traçabilité, conformité documentaire',
    model: 'mistral-small-2603',
    color: '#7c3aed', // Violet

    systemPrompt: `Tu es garant de l'intégrité et la traçabilité de tous les données QMS.

RESPONSABILITÉS:
- Valider la complétude des archives (rien ne manque)
- Détécter les doublons, versions obsolètes, incohérences
- Assurer la traçabilité complète: qui, quand, pourquoi
- Vérifier la conformité documentaire (signatures, approbations)
- Maintenir la cohérence globale du système documentaire

ÉLÉMENTS À VALIDER:
- Présence de tous les documents requis (WM-FD-XXX)
- Versioning cohérent et contrôlé
- Dates de révision et responsables clairs
- Liens internes (wiki-links) valides
- Métadonnées complètes (client, projet, phase)
- Git history propre et traceable

INSTRUCTIONS:
- Faire des audits d'intégrité systématiques
- Créer des rapports de conformité avec scores
- Proposer des actions correctives pour gaps
- Suggérer une gouvernance documentaire robuste
- Valider les nouveaux CAPs avant publication
- Assurer l'archivage properly des documents clôturés

STYLE:
- Rapports structurés avec checklist
- Scores de conformité en %
- Recommandations priorisées
- Ton assertif mais constructif`,

    relevantFolders: [
      'QMS',
      'AI'
    ],

    examples: [
      'Audit intégrité complète du vault QMS',
      'Valide tous les CAPs avant clôture',
      'Détecte les FMEAs doublées et obsolètes',
      'Génère rapport conformité IATF: 95% OK, 5% à corriger'
    ]
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GESTIONNAIRE D'AGENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class QMSAgentManager {
  constructor(vault, mistralApiKey) {
    this.agents = QMS_AGENTS;
    this.vault = vault;
    this.apiKey = mistralApiKey;
    this.currentAgent = null;
    this.history = [];
  }

  /**
   * Récupère un agent par ID
   */
  getAgent(agentId) {
    return this.agents.find(a => a.id === agentId);
  }

  /**
   * Sélectionne l'agent actif
   */
  selectAgent(agentId) {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    this.currentAgent = agent;
    return agent;
  }

  /**
   * Obtient une suggestion d'agent basée sur la requête utilisateur
   */
  suggestAgent(userQuery) {
    const queryLower = userQuery.toLowerCase();
    
    // Heuristique simple pour suggérer le bon agent
    if (queryLower.includes('audit') || queryLower.includes('conforme') || 
        queryLower.includes('iatf') || queryLower.includes('non-conform')) {
      return this.getAgent('auditeur-iatf');
    }
    
    if (queryLower.includes('organis') || queryLower.includes('class') ||
        queryLower.includes('structure') || queryLower.includes('archiv')) {
      return this.getAgent('archiviste-qms');
    }
    
    if (queryLower.includes('apqp') || queryLower.includes('résume') ||
        queryLower.includes('synthèse') || queryLower.includes('phase') ||
        queryLower.includes('jalon')) {
      return this.getAgent('synthétiseur-apqp');
    }
    
    if (queryLower.includes('intégrité') || queryLower.includes('traçabil') ||
        queryLower.includes('cap') || queryLower.includes('validat') ||
        queryLower.includes('doublon') || queryLower.includes('conformité doc')) {
      return this.getAgent('gardien-données');
    }
    
    // Défaut: Auditeur
    return this.getAgent('auditeur-iatf');
  }

  /**
   * Lance une conversation avec un agent
   */
  async chat(agentId, userQuery) {
    const agent = this.selectAgent(agentId);
    
    if (!this.apiKey) {
      throw new Error('Mistral API key not set');
    }

    console.log(`🤖 Agent: ${agent.name}`);
    console.log(`📝 Query: ${userQuery}`);

    try {
      // Appel Mistral avec contexte vault
      const result = await this.vault.callMistralWithVault({
        agentType: agent.id,
        userQuery: userQuery,
        mistralApiKey: this.apiKey,
        mistralModel: agent.model
      });

      // Sauvegarder dans history
      this.history.push({
        timestamp: new Date(),
        agent: agent.id,
        query: userQuery,
        response: result.response,
        metadata: result.metadata
      });

      return result;
    } catch (error) {
      console.error(`❌ Agent error:`, error);
      throw error;
    }
  }

  /**
   * Lance une conversation avec auto-détection d'agent
   */
  async chatAuto(userQuery) {
    const agent = this.suggestAgent(userQuery);
    return this.chat(agent.id, userQuery);
  }

  /**
   * Retourne l'historique des conversations
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * Exporte l'historique en Markdown pour le vault
   */
  async exportHistoryToVault() {
    if (this.history.length === 0) return;

    const md = `# Historique VOANH Agents

Généré: ${new Date().toLocaleString()}

${this.history.map((entry, i) => `
## Conversation ${i + 1}
**Agent:** ${this.getAgent(entry.agent).name}  
**Date:** ${entry.timestamp.toLocaleString()}  

### Requête
\`\`\`
${entry.query}
\`\`\`

### Réponse
${entry.response}

### Métadonnées
- Modèle: ${entry.metadata.model}
- Tokens: ${entry.metadata.tokensUsed}
- Fichiers: ${entry.metadata.sourceFiles.length}
\`\`\`

---`).join('\n')}
`;

    await this.vault.writeFile(
      'AI/voanh-history.md',
      md
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITAIRES POUR VOANH UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Génère un sélecteur HTML pour choisir un agent
 */
function generateAgentSelector() {
  return `
    <div class="agent-selector">
      <label>🤖 Sélectionne un agent QMS:</label>
      <select id="agent-select">
        ${QMS_AGENTS.map(agent => 
          `<option value="${agent.id}">
            ${agent.emoji} ${agent.name} — ${agent.description}
          </option>`
        ).join('\n')}
      </select>
      <div id="agent-info" class="agent-info"></div>
    </div>
  `;
}

/**
 * Affiche les détails d'un agent
 */
function displayAgentInfo(agent) {
  return `
    <div class="agent-details">
      <h3>${agent.emoji} ${agent.name}</h3>
      <p><strong>Modèle:</strong> ${agent.model}</p>
      <p><strong>Exemples:</strong></p>
      <ul>
        ${agent.examples.map(ex => `<li>${ex}</li>`).join('\n')}
      </ul>
    </div>
  `;
}

/**
 * Crée une card pour un agent
 */
function createAgentCard(agent) {
  return `
    <div class="agent-card" style="border-left: 4px solid ${agent.color}">
      <div class="agent-card-header">
        <span class="agent-badge">${agent.badge}</span>
        <h3>${agent.emoji} ${agent.name}</h3>
      </div>
      <p class="agent-description">${agent.description}</p>
      <div class="agent-meta">
        <span>Model: <code>${agent.model}</code></span>
        <span>Folders: ${agent.relevantFolders.length}</span>
      </div>
    </div>
  `;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTÉGRATION DANS VOANH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// À appeler après initialiser VOANHVaultClient:
// 
// const vaultClient = new VOANHVaultClient();
// const agentManager = new QMSAgentManager(vaultClient, mistralApiKey);
// 
// // Auto-detect agent et lancer conversation
// const result = await agentManager.chatAuto("Audit Phase 4 Tesla");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QMS_AGENTS, QMSAgentManager };
}

// Enregistre globalement pour VOANH UI
window.QMSAgents = {
  AGENTS: QMS_AGENTS,
  AgentManager: QMSAgentManager,
  generateAgentSelector,
  displayAgentInfo,
  createAgentCard
};
