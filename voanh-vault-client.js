/**
 * ═══════════════════════════════════════════════════════════════
 * VOANH VAULT CLIENT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Code à intégrer dans index.html VOANH
 * Permet aux agents QMS de lire et enrichir le vault Obsidian
 * 
 * S'intègre avec:
 * - voanh-vault-integration.js (Node.js API locale)
 * - Mistral API (client-side)
 * 
 * ═══════════════════════════════════════════════════════════════
 */

class VOANHVaultClient {
  constructor(apiBaseUrl = 'http://localhost:3000') {
    this.apiBase = apiBaseUrl;
    this.cache = new Map();
    this.index = null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH & INITIALIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Vérifie que le service vault est accessible
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.apiBase}/api/health`);
      return await res.json();
    } catch (error) {
      console.error('❌ Vault service not accessible:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Initialise le client et charge l'index
   */
  async init() {
    const health = await this.checkHealth();
    if (health.status !== 'ok') {
      throw new Error(`Vault service unavailable: ${health.error}`);
    }

    const structure = await this.getVaultStructure();
    this.index = structure.structure;
    console.log(`✓ Vault client initialized: ${structure.totalFiles} files indexed`);
    return structure;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASIC OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Récupère la structure complète du vault
   */
  async getVaultStructure() {
    try {
      const res = await fetch(`${this.apiBase}/api/structure`);
      return await res.json();
    } catch (error) {
      console.error('Error fetching vault structure:', error);
      throw error;
    }
  }

  /**
   * Cherche des fichiers par mots-clés
   * @param {string} keywords - "word1 word2 word3"
   * @returns {Promise<Array>}
   */
  async search(keywords) {
    try {
      const query = encodeURIComponent(keywords);
      const res = await fetch(`${this.apiBase}/api/search?q=${query}`);
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Lit un fichier spécifique du vault
   * @param {string} filePath - "QMS/Administration/Quality_Manual.md"
   * @returns {Promise<string>}
   */
  async readFile(filePath) {
    // Vérifier le cache
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    try {
      const query = encodeURIComponent(filePath);
      const res = await fetch(`${this.apiBase}/api/file?path=${query}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Mettre en cache
      this.cache.set(filePath, data.content);
      return data.content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Liste les fichiers d'un dossier
   * @param {string} folderPath - "QMS/Project Delivery"
   * @returns {Promise<Array>}
   */
  async listFolder(folderPath) {
    try {
      const query = encodeURIComponent(folderPath);
      const res = await fetch(`${this.apiBase}/api/folder?path=${query}`);
      const data = await res.json();
      return data.files || [];
    } catch (error) {
      console.error(`Error listing folder ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * Écrit un fichier dans le vault
   * @param {string} filePath - "QMS/New_Document.md"
   * @param {string} content - Contenu Markdown
   * @returns {Promise<Object>}
   */
  async writeFile(filePath, content) {
    try {
      const res = await fetch(`${this.apiBase}/api/write-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });
      const data = await res.json();
      
      if (data.success) {
        this.cache.delete(filePath); // Invalide le cache
      }
      
      return data;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QMS AGENT OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Récupère le contexte pour un agent QMS spécifique
   * @param {string} agentType - "auditeur-iatf" | "archiviste-qms" | etc.
   * @param {string} query - "CAP BorgWarner"
   * @returns {Promise<Array>}
   */
  async getAgentContext(agentType, query) {
    try {
      const q = encodeURIComponent(query);
      const res = await fetch(
        `${this.apiBase}/api/agent-context?type=${agentType}&query=${q}`
      );
      const data = await res.json();
      return data.context || [];
    } catch (error) {
      console.error(`Error getting context for ${agentType}:`, error);
      return [];
    }
  }

  /**
   * Récupère l'index WM-FD-XXX
   */
  async getWMIndex() {
    try {
      const res = await fetch(`${this.apiBase}/api/wm-index`);
      const data = await res.json();
      return data.index || {};
    } catch (error) {
      console.error('Error fetching WM index:', error);
      return {};
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MISTRAL + VAULT INTEGRATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Crée un contexte enrichi pour une requête Mistral
   * Combine vault context + agent-specific instructions
   * 
   * @param {string} agentType - Agent QMS
   * @param {string} userQuery - La question de l'utilisateur
   * @param {string} mistralApiKey - Clé API Mistral
   * @returns {Promise<Object>} { systemPrompt, contextFiles, fullContext }
   */
  async buildMistralContext(agentType, userQuery, mistralApiKey) {
    // 1. Définit les prompts système pour chaque agent
    const AGENT_PROMPTS = {
      'auditeur-iatf': `Tu es un auditeur qualité spécialisé dans IATF 16949.
Tu dois:
- Vérifier la conformité des documents QMS
- Identifier les non-conformités potentielles
- Proposer des corrections basées sur IATF 16949
- Référencer toujours les WM-FD-XXX appropriés
Réponds en français. Sois précis et pratique.`,

      'archiviste-qms': `Tu es responsable de l'organisation du vault QMS.
Tu dois:
- Proposer une structure organisée pour les documents
- Classifier les fichiers selon l'arborescence v3
- Assurer la cohérence de la nomenclature WM-FD-XXX
- Suggérer des améliorations structurelles
Réponds en français. Propose des actions concrètes.`,

      'synthétiseur-apqp': `Tu es expert en gestion de projets APQP.
Tu dois:
- Résumer les phases APQP (1-5)
- Identifier les jalons clés et les risques
- Proposer des actions correctives
- Fournir des synthèses exécutives
Réponds en français. Sois clair et concis.`,

      'gardien-données': `Tu es garant de l'intégrité des données QMS.
Tu dois:
- Valider la traçabilité des documents
- Détecter les doublons et incohérences
- Vérifier la complétude des archives
- Proposer des améliorations de gouvernance
Réponds en français. Sois rigoureux et détaillé.`
    };

    // 2. Récupère le contexte du vault
    const vaultContext = await this.getAgentContext(agentType, userQuery);

    // 3. Formate le contexte pour Mistral
    const contextText = vaultContext
      .map(ctx => `\n📄 Fichier: ${ctx.path} (${ctx.wm || 'N/A'})
───────────────────────────────────────────
${ctx.content}
───────────────────────────────────────────`)
      .join('\n');

    // 4. Retourne un objet complet pour passer à Mistral
    return {
      systemPrompt: AGENT_PROMPTS[agentType] || AGENT_PROMPTS['auditeur-iatf'],
      contextFiles: vaultContext.map(c => ({
        path: c.path,
        wm: c.wm,
        score: c.score
      })),
      vaultContext: contextText,
      fullContext: {
        agent: agentType,
        query: userQuery,
        filesCount: vaultContext.length,
        contextSize: contextText.length
      }
    };
  }

  /**
   * Appelle Mistral avec contexte du vault
   * Retourne la réponse enrichie avec source tracking
   * 
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async callMistralWithVault({
    agentType,
    userQuery,
    mistralApiKey,
    mistralModel = 'mistral-medium-2505'
  }) {
    if (!mistralApiKey) {
      throw new Error('Mistral API key required');
    }

    // Construire le contexte enrichi
    const context = await this.buildMistralContext(
      agentType,
      userQuery,
      mistralApiKey
    );

    // Construire le message pour Mistral
    const userMessage = `${context.vaultContext}

QUESTION DE L'UTILISATEUR:
${userQuery}`;

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: mistralModel,
          messages: [
            {
              role: 'system',
              content: context.systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Mistral API error');
      }

      return {
        success: true,
        response: data.choices[0].message.content,
        metadata: {
          agent: agentType,
          query: userQuery,
          model: mistralModel,
          sourceFiles: context.contextFiles,
          tokensUsed: data.usage?.total_tokens,
          contextSize: context.fullContext.contextSize
        }
      };
    } catch (error) {
      console.error('Mistral call error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          agent: agentType,
          query: userQuery
        }
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WORKFLOW EXAMPLES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Cas d'usage 1: Audit IATF complet
   */
  async workflowAuditProject(projectName, mistralApiKey) {
    console.log(`🔍 Audit IATF: ${projectName}`);

    const result = await this.callMistralWithVault({
      agentType: 'auditeur-iatf',
      userQuery: `Audit complet du projet ${projectName}. Vérifier la conformité IATF 16949.`,
      mistralApiKey
    });

    if (result.success) {
      // Optionnel: sauvegarder le rapport d'audit
      const reportPath = `QMS/Data Repository/Audits/${projectName}_${new Date().toISOString().split('T')[0]}.md`;
      
      const report = `# Rapport d'Audit IATF — ${projectName}
Date: ${new Date().toLocaleString()}
Agent: Auditeur IATF

## Analyse

${result.response}

## Fichiers consultés
${result.metadata.sourceFiles.map(f => `- ${f.path} (${f.wm})`).join('\n')}
`;

      // await this.writeFile(reportPath, report);
      console.log(`✓ Audit report would be saved to: ${reportPath}`);
    }

    return result;
  }

  /**
   * Cas d'usage 2: Résumer un APQP
   */
  async workflowSummarizeAPQP(clientName, mistralApiKey) {
    console.log(`📊 Résumé APQP: ${clientName}`);

    const result = await this.callMistralWithVault({
      agentType: 'synthétiseur-apqp',
      userQuery: `Résume le projet APQP pour le client ${clientName}. Identifie les phases, jalons et risques.`,
      mistralApiKey
    });

    return result;
  }

  /**
   * Cas d'usage 3: Générer un CAP structuré
   */
  async workflowGenerateCAP(issueDescription, mistralApiKey) {
    console.log(`📋 Génération CAP: ${issueDescription.slice(0, 50)}...`);

    const result = await this.callMistralWithVault({
      agentType: 'gardien-données',
      userQuery: `Crée un CAP (Corrective Action Plan) pour: ${issueDescription}. 
      Utilise le template WM-FD-040 et assure la traçabilité complète.`,
      mistralApiKey
    });

    return result;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT & USAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// En navigation: new VOANHVaultClient()
// En Node.js: module.exports = VOANHVaultClient;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VOANHVaultClient;
}
