#!/usr/bin/env python3
"""
HTML Localization Script: French -> US English
Preserves structure, attributes, variable names, and logic.
Translates: user-facing text, comments, placeholders, titles, buttons, labels.
"""

import re
import html

# Comprehensive translation dictionary for UI terms
UI_TRANSLATIONS = {
    # General UI
    "Votre Intelligence Artificielle Personnelle": "Your Personal Artificial Intelligence",
    "VOANH AI": "VOANH AI",  # Keep brand name
    "Statut": "Status",
    "Thème": "Theme",
    "Modèle": "Model",
    "Agent": "Agent",
    "Actions": "Actions",
    "Chat": "Chat",
    "Archives": "Archives",
    "Memory": "Memory",
    "Mémoire": "Memory",
    
    # Buttons
    "Envoyer": "Send",
    "Annuler": "Cancel",
    "Valider": "Validate",
    "Confirmer": "Confirm",
    "Sauvegarder": "Save",
    "Supprimer": "Delete",
    "Modifier": "Edit",
    "Créer": "Create",
    "Nouveau": "New",
    "Actualiser": "Refresh",
    "Rechercher": "Search",
    "Fermer": "Close",
    "Ok": "OK",
    "Oui": "Yes",
    "Non": "No",
    
    # Status
    "En ligne": "Online",
    "Hors ligne": "Offline",
    "Connecté": "Connected",
    "Déconnecté": "Disconnected",
    "Chargement": "Loading",
    "Prêt": "Ready",
    "Erreur": "Error",
    "Succès": "Success",
    "Attention": "Warning",
    
    # API Key Modal
    "Clé API": "API Key",
    "Entrez votre clé API": "Enter your API key",
    "Tutoriel": "Tutorial",
    "Étapes": "Steps",
    "Étape": "Step",
    "Configuration": "Configuration",
    "Paramètres": "Settings",
    "Paramètres avancés": "Advanced Settings",
    
    # Chat related
    "Message": "Message",
    "Messages": "Messages",
    "Conversation": "Conversation",
    "Conversations": "Conversations",
    "Historique": "History",
    "Effacer l'historique": "Clear history",
    "Exporter": "Export",
    "Importer": "Import",
    
    # Form labels
    "Nom": "Name",
    "Email": "Email",
    "Mot de passe": "Password",
    "Utilisateur": "User",
    "Description": "Description",
    "Type": "Type",
    "Option": "Option",
    "Options": "Options",
    "Sélectionner": "Select",
    "Choisir": "Choose",
    
    # Tech terms often in French
    "Cerveau Central": "Central Brain",
    "Agents Existants": "Existing Agents",
    "Onglets": "Tabs",
    "Explication": "Explanation",
    "Informations": "Information",
    "Aide": "Help",
    "Documentation": "Documentation",
    
    # Common phrases
    "Veuillez": "Please",
    "Patientez": "Please wait",
    "Traitement en cours": "Processing",
    "Aucun résultat": "No results",
    "Aucune donnée": "No data",
    "Tout effacer": "Clear all",
    "Êtes-vous sûr": "Are you sure",
    
    # Header/Navigation
    "Accueil": "Home",
    "Tableau de bord": "Dashboard",
    "Profil": "Profile",
    "Déconnexion": "Logout",
    "Connexion": "Login",
    "Inscription": "Sign up",
    
    # Time related
    "Aujourd'hui": "Today",
    "Hier": "Yesterday",
    "Maintenant": "Now",
    "Jamais": "Never",
    
    # Misc
    "Actif": "Active",
    "Inactif": "Inactive",
    "Activé": "Enabled",
    "Désactivé": "Disabled",
    "Visible": "Visible",
    "Masqué": "Hidden",
    "Par défaut": "Default",
    "Personnalisé": "Custom",
    "Avancé": "Advanced",
    "Simple": "Simple",
    "Rapide": "Quick",
    "Lent": "Slow",
    "Grand": "Large",
    "Petit": "Small",
    "Moyen": "Medium",
}

# Regex patterns for different HTML elements
TITLE_PATTERN = re.compile(r'(<title[^>]*>)([^<]+)(</title>)', re.IGNORECASE)
PLACEHOLDER_PATTERN = re.compile(r'(placeholder\s*=\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)
BUTTON_PATTERN = re.compile(r'(<button[^>]*>)([^<]+)(</button>)', re.IGNORECASE)
LABEL_PATTERN = re.compile(r'(<label[^>]*>)([^<]+)(</label>)', re.IGNORECASE)
SPAN_PATTERN = re.compile(r'(<span[^>]*>)([^<]+)(</span>)', re.IGNORECASE)
DIV_TEXT_PATTERN = re.compile(r'(<div[^>]*>)([^<]+)(</div>)', re.IGNORECASE)
H_PATTERN = re.compile(r'(<h[1-6][^>]*>)([^<]+)(</h[1-6]>)', re.IGNORECASE)
P_PATTERN = re.compile(r'(<p[^>]*>)([^<]+)(</p>)', re.IGNORECASE)
OPTION_PATTERN = re.compile(r'(<option[^>]*>)([^<]+)(</option>)', re.IGNORECASE)
ALT_PATTERN = re.compile(r'(alt\s*=\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)
ARIA_LABEL_PATTERN = re.compile(r'(aria-label\s*=\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)
TITLE_ATTR_PATTERN = re.compile(r'(\stitle\s*=\s*["\'])([^"\']+)(["\'])', re.IGNORECASE)

# Comment pattern
COMMENT_PATTERN = re.compile(r'(<!--\s*)([^>]-+)(\s*-->)')


def translate_text(text, context=""):
    """Translate French text to English using dictionary and heuristics."""
    if not text or not text.strip():
        return text
    
    stripped = text.strip()
    
    # Check exact match first
    if stripped in UI_TRANSLATIONS:
        translation = UI_TRANSLATIONS[stripped]
        # Preserve original whitespace
        return text.replace(stripped, translation)
    
    # Check for partial matches (case-insensitive)
    result = text
    for fr, en in sorted(UI_TRANSLATIONS.items(), key=lambda x: -len(x[0])):
        # Case-insensitive replacement while preserving case pattern
        pattern = re.compile(re.escape(fr), re.IGNORECASE)
        
        def replace_match(match):
            matched = match.group(0)
            # Preserve case style
            if matched.isupper():
                return en.upper()
            elif matched[0].isupper():
                return en.capitalize() if len(en) > 1 else en.upper()
            else:
                return en.lower() if len(en) > 1 else en
        
        result = pattern.sub(replace_match, result)
    
    return result


def translate_comments(html_content):
    """Translate HTML comments that contain French text."""
    def replace_comment(match):
        prefix = match.group(1)
        comment_text = match.group(2)
        suffix = match.group(3)
        
        # Skip decorative comments (like ════)
        if '═' in comment_text or comment_text.strip().startswith('═'):
            return match.group(0)
        
        # Translate the comment text
        translated = translate_text(comment_text)
        return f"{prefix}{translated}{suffix}"
    
    return COMMENT_PATTERN.sub(replace_comment, html_content)


def translate_attribute_value(html_content, pattern, attr_name):
    """Translate attribute values matching the given pattern."""
    def replace_attr(match):
        prefix = match.group(1)
        value = match.group(2)
        suffix = match.group(3)
        
        translated = translate_text(value)
        return f"{prefix}{translated}{suffix}"
    
    return pattern.sub(replace_attr, html_content)


def translate_element_content(html_content, pattern):
    """Translate content within HTML elements."""
    def replace_element(match):
        open_tag = match.group(1)
        content = match.group(2)
        close_tag = match.group(3)
        
        # Skip if content looks like code, variable, or already English
        if re.match(r'^[\s]*$', content):
            return match.group(0)
        
        # Skip numeric-only content
        if content.strip().isdigit():
            return match.group(0)
        
        # Skip if contains mostly code-like characters
        if re.search(r'[{}()\[\];=+\-*/&|^~]', content):
            return match.group(0)
        
        translated = translate_text(content)
        return f"{open_tag}{translated}{close_tag}"
    
    return pattern.sub(replace_element, html_content)


def translate_html_file(input_path, output_path):
    """Main function to translate an HTML file."""
    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"Processing {input_path}...")
    
    # Step 1: Update lang attribute
    html_content = re.sub(r'lang="fr"', 'lang="en"', html_content)
    html_content = re.sub(r"lang='fr'", "lang='en'", html_content)
    
    # Step 2: Translate title
    html_content = translate_element_content(html_content, TITLE_PATTERN)
    
    # Step 3: Translate placeholders
    html_content = translate_attribute_value(html_content, PLACEHOLDER_PATTERN, 'placeholder')
    
    # Step 4: Translate alt attributes
    html_content = translate_attribute_value(html_content, ALT_PATTERN, 'alt')
    
    # Step 5: Translate aria-label attributes
    html_content = translate_attribute_value(html_content, ARIA_LABEL_PATTERN, 'aria-label')
    
    # Step 6: Translate title attributes
    html_content = translate_attribute_value(html_content, TITLE_ATTR_PATTERN, 'title')
    
    # Step 7: Translate button content
    html_content = translate_element_content(html_content, BUTTON_PATTERN)
    
    # Step 8: Translate label content
    html_content = translate_element_content(html_content, LABEL_PATTERN)
    
    # Step 9: Translate heading content
    html_content = translate_element_content(html_content, H_PATTERN)
    
    # Step 10: Translate paragraph content
    html_content = translate_element_content(html_content, P_PATTERN)
    
    # Step 11: Translate option content
    html_content = translate_element_content(html_content, OPTION_PATTERN)
    
    # Step 12: Translate span content (careful with nested content)
    # Only translate spans without child elements
    simple_span_pattern = re.compile(r'(<span[^>]*>)([^<>]+)(</span>)', re.IGNORECASE)
    html_content = translate_element_content(html_content, simple_span_pattern)
    
    # Step 13: Translate comments
    html_content = translate_comments(html_content)
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Translation complete. Output written to {output_path}")
    return True


if __name__ == "__main__":
    translate_html_file("/workspace/index.html", "/workspace/index_en.html")
