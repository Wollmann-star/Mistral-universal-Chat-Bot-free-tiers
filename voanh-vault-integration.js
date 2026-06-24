/**
 * ═══════════════════════════════════════════════════════════════
 * VOANH ↔ OBSIDIAN VAULT INTEGRATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * Permet à VOANH (interface web) de lire/interroger un vault Obsidian
 * via une API REST locale (localhost:3000).
 * 
 * Installation: npm install express fs-extra path-browserify
 * Lancer: node voanh-vault-integration.js /chemin/vers/vault
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const app = express();
const PORT = 3000;

// Récupère le chemin du vault depuis la ligne de commande
const VAULT_PATH = process.argv[2] || path.join(process.env.HOME, 'Obsidian/WMT');

if (!fs.existsSync(VAULT_PATH)) {
  console.error(`❌ Erreur: Le vault n'existe pas à ${VAULT_PATH}`);
  process.exit(1);
}

console.log(`✓ Vault chargé: ${VAULT_PATH}`);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEX QMS — WM-FD-XXX MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const QMS_INDEX = {
  'WM-FD-001': 'Quality Manual',
  'WM-FD-012': 'PPAP Procedure',
  'WM-FD-025': 'SPC Instructions',
  'WM-FD-030': 'FMEA Template',
  'WM-FD-040': 'CAP Template',
  'WM-FD-050': 'APQP Gate Review',
  'WM-FD-060': 'MSA Protocol',
  'WM-FD-070': '8D Problem Solving',
  'WM-FD-080': 'Document Control',
  'WM-FD-090': 'Audit Schedule',
};

// Structure attendue du vault
const VAULT_STRUCTURE = {
  QMS: {
    Administration: 'Quality documentation',
    'Project Delivery': 'APQP phases by client',
    'Data Repository': 'PPAP, MSA, SPC, FMEA',
    Warehouse: 'Product specs and configs'
  },
  AI: {
    'voanh-context.md': 'VOANH persistent memory',
    'qms-agents.md': '4 agents roles + prompts',
    'vault-index.md': 'WM-FD-XXX index',
    'memory.md': 'Important conversations'
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VAULT READER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VaultReader {
  /**
   * Lit tous les fichiers .md du vault et construit un index
   */
  async buildIndex() {
    const index = [];
    
    const walkDir = async (dir, relPath = '') => {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        // Skip hidden dirs et .obsidian
        if (file.startsWith('.') || file === 'node_modules') continue;
        
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        const filePath = path.join(relPath, file);
        
        if (stat.isDirectory()) {
          await walkDir(fullPath, filePath);
        } else if (file.endsWith('.md')) {
          // Extrait WM-FD-XXX du nom ou du contenu
          const content = await fs.readFile(fullPath, 'utf8');
          const wm = this.extractWMCode(file, content);
          
          index.push({
            path: filePath,
            fullPath: fullPath,
            name: file,
            wm: wm,
            folder: relPath,
            size: stat.size,
            mtime: stat.mtime,
            contentPreview: content.slice(0, 200)
          });
        }
      }
    };
    
    await walkDir(VAULT_PATH);
    return index;
  }

  /**
   * Extrait le code WM-FD-XXX du nom de fichier ou du contenu
   */
  extractWMCode(filename, content) {
    // Cherche d'abord dans le nom du fichier
    const nameMatch = filename.match(/(WM-FD-\d{3})/);
    if (nameMatch) return nameMatch[1];
    
    // Puis dans le contenu (première ligne ou titre)
    const contentMatch = content.match(/(WM-FD-\d{3})/);
    if (contentMatch) return contentMatch[1];
    
    return null;
  }

  /**
   * Lit un fichier spécifique du vault
   */
  async readFile(filePath) {
    const fullPath = path.join(VAULT_PATH, filePath);
    
    // Sécurité: refuse les path traversal
    if (!fullPath.startsWith(VAULT_PATH)) {
      throw new Error('Access denied: path traversal attempt');
    }
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * Recherche par mots-clés dans les fichiers
   */
  async search(index, keywords) {
    const results = [];
    const keywordList = keywords.toLowerCase().split(' ');
    
    for (const file of index) {
      let score = 0;
      const contentLower = file.contentPreview.toLowerCase();
      
      // Score basé sur le nombre de mots-clés trouvés
      for (const kw of keywordList) {
        if (contentLower.includes(kw)) score++;
        if (file.name.toLowerCase().includes(kw)) score += 2;
        if (file.wm && file.wm.includes(kw.toUpperCase())) score += 3;
      }
      
      if (score > 0) {
        results.push({ ...file, score });
      }
    }
    
    // Trie par score
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  /**
   * Récupère tous les fichiers d'un dossier
   */
  async listFolder(folderPath) {
    const fullPath = path.join(VAULT_PATH, folderPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }
    
    const files = await fs.readdir(fullPath);
    return files
      .filter(f => f.endsWith('.md') && !f.startsWith('.'))
      .map(f => path.join(folderPath, f));
  }

  /**
   * Récupère le contexte pour un agent QMS
   * (combine plusieurs fichiers pertinents)
   */
  async getAgentContext(index, agentType, query) {
    let relevantFolders = [];
    
    switch(agentType) {
      case 'auditeur-iatf':
        relevantFolders = ['QMS/Administration', 'QMS/Data Repository'];
        break;
      case 'archiviste-qms':
        relevantFolders = ['QMS'];
        break;
      case 'synthétiseur-apqp':
        relevantFolders = ['QMS/Project Delivery'];
        break;
      case 'gardien-données':
        relevantFolders = ['QMS', 'AI'];
        break;
      default:
        relevantFolders = ['QMS'];
    }
    
    // Filtre l'index par dossiers pertinents
    const filtered = index.filter(f => 
      relevantFolders.some(folder => f.folder.startsWith(folder))
    );
    
    // Cherche par query
    const searched = await this.search(filtered, query);
    
    // Charge le contenu des top 5 résultats
    const context = [];
    for (const result of searched.slice(0, 5)) {
      try {
        const content = await this.readFile(result.path);
        context.push({
          path: result.path,
          wm: result.wm,
          content: content.slice(0, 1000), // Limiter à 1000 caractères
          score: result.score
        });
      } catch (e) {
        console.error(`Erreur lecture ${result.path}:`, e.message);
      }
    }
    
    return context;
  }

  /**
   * Retourne la structure complète du vault
   */
  async getVaultStructure() {
    const index = await this.buildIndex();
    
    const structure = {};
    
    for (const file of index) {
      const folder = file.folder || 'root';
      if (!structure[folder]) {
        structure[folder] = [];
      }
      structure[folder].push({
        name: file.name,
        wm: file.wm,
        path: file.path
      });
    }
    
    return structure;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INITIALISATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const vault = new VaultReader();
let vaultIndex = null;

(async () => {
  console.log('🔄 Indexation du vault...');
  vaultIndex = await vault.buildIndex();
  console.log(`✓ ${vaultIndex.length} fichiers indexés`);
})();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API REST ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use(express.json());

/**
 * GET /api/health
 * Vérifie que le service est actif
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    vault: VAULT_PATH,
    indexed: vaultIndex?.length || 0
  });
});

/**
 * GET /api/structure
 * Retourne la structure complète du vault
 */
app.get('/api/structure', async (req, res) => {
  try {
    const structure = await vault.getVaultStructure();
    res.json({
      success: true,
      structure: structure,
      totalFiles: vaultIndex.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/search?q=keyword1+keyword2
 * Recherche par mots-clés
 */
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    const results = await vault.search(vaultIndex, query);
    res.json({
      success: true,
      query: query,
      results: results.map(r => ({
        path: r.path,
        wm: r.wm,
        name: r.name,
        folder: r.folder,
        score: r.score
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/file?path=QMS/Administration/Quality_Manual.md
 * Lit un fichier spécifique
 */
app.get('/api/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }
    
    const content = await vault.readFile(filePath);
    res.json({
      success: true,
      path: filePath,
      content: content
    });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/folder?path=QMS/Project Delivery
 * Liste les fichiers d'un dossier
 */
app.get('/api/folder', async (req, res) => {
  try {
    const folderPath = req.query.path || 'QMS';
    const files = await vault.listFolder(folderPath);
    
    res.json({
      success: true,
      folder: folderPath,
      files: files
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/agent-context?type=auditeur-iatf&query=CAP+BorgWarner
 * Récupère le contexte pour un agent QMS spécifique
 */
app.get('/api/agent-context', async (req, res) => {
  try {
    const agentType = req.query.type || 'auditeur-iatf';
    const query = req.query.query || '';
    
    const context = await vault.getAgentContext(vaultIndex, agentType, query);
    
    res.json({
      success: true,
      agent: agentType,
      query: query,
      context: context,
      contextSize: context.reduce((sum, c) => sum + c.content.length, 0)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/wm-index
 * Retourne le mapping WM-FD-XXX
 */
app.get('/api/wm-index', (req, res) => {
  res.json({
    success: true,
    index: QMS_INDEX
  });
});

/**
 * POST /api/write-file
 * Écrit un fichier dans le vault (pour VOANH)
 */
app.post('/api/write-file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Missing path or content' });
    }
    
    const fullPath = path.join(VAULT_PATH, filePath);
    
    // Sécurité
    if (!fullPath.startsWith(VAULT_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Crée les dossiers parents si nécessaire
    await fs.ensureDir(path.dirname(fullPath));
    
    // Écrit le fichier
    await fs.writeFile(fullPath, content, 'utf8');
    
    // Commit automatique optionnel
    try {
      execSync(`cd ${VAULT_PATH} && git add "${filePath}" && git commit -m "VOANH: Updated ${filePath}"`, {
        stdio: 'pipe'
      });
    } catch (e) {
      // Git peut échouer si rien à commit, c'est OK
    }
    
    res.json({
      success: true,
      path: filePath,
      size: content.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DÉMARRAGE DU SERVEUR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.listen(PORT, () => {
  console.log(`\n🚀 VOANH Vault API démarrée sur http://localhost:${PORT}`);
  console.log(`\n📚 Endpoints disponibles:`);
  console.log(`   GET  /api/health               — Vérifier le service`);
  console.log(`   GET  /api/structure            — Structure complète du vault`);
  console.log(`   GET  /api/search?q=...        — Rechercher par mots-clés`);
  console.log(`   GET  /api/file?path=...       — Lire un fichier`);
  console.log(`   GET  /api/folder?path=...     — Lister un dossier`);
  console.log(`   GET  /api/agent-context?...   — Contexte pour un agent QMS`);
  console.log(`   GET  /api/wm-index            — Index WM-FD-XXX`);
  console.log(`   POST /api/write-file          — Écrire un fichier\n`);
});

module.exports = VaultReader;
