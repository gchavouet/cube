# cube
# 📊 Cube Pivot

**Cube Pivot** est une application web inspirée des **tableaux croisés dynamiques Excel**, permettant de manipuler un tableau d'objets (`wsData.data`) de manière interactive avec drag & drop, filtres, regroupements, fonctions d’agrégation et gestion de modèles enregistrables.

---

## 🚀 Fonctionnalités

- 🎯 Glisser-déposer de champs dans les zones : lignes, colonnes, valeurs
- 📂 Import/export de modèles (`JSON`)
- 💾 Sauvegarde côté serveur via `save_model.php`
- 📈 Agrégation par somme, moyenne, compte
- 🔄 Rechargement dynamique de la structure
- 🌗 Thème clair / sombre personnalisable
- 📦 Export des résultats en CSV
- 📁 Liste paginée des modèles enregistrés

---

## 🧩 Structure des fichiers

```bash
cube-pivot/
│
├── index.html          # Interface principale
├── style.css           # Styles de l'application (claire et sombre)
├── app.js              # Logique complète du cube
├── save_model.php      # Endpoint pour stocker les modèles
└── models/             # Dossier où sont enregistrés les modèles JSON
```

---

## 🛠️ Installation

1. Dépose les fichiers sur un serveur web local (ex : XAMPP, WAMP, ou hébergeur PHP)
2. Assure-toi que le dossier `models/` est **accessible en écriture**
3. Accède à `http://localhost/chemin/index.html` dans ton navigateur

---

## ✨ Utilisation

- **Ajouter un modèle** : bouton `Ajouter`
- **Sauvegarder** : bouton `Sauvegarder`
- **Afficher le cube** : bouton `Afficher Cube`
- **Changer de thème** : bouton `🎨 Thème`

Pour chaque modèle, tu peux :
- Glisser les champs en haut dans les zones `Lignes`, `Colonnes`, `Valeurs`
- Choisir une fonction d’agrégation (`sum`, `avg`, `count`) pour chaque valeur
- Appliquer des filtres par champ

---

## 📦 Export & Import

- **Exporter** tous les modèles : JSON ou CSV
- **Importer** : charge un fichier `.json` conforme avec le tag `__cube_type`

---

## 🧪 Exemple de structure `wsData`

```js
const wsData = {
  data: [
    { client: "ACME", mois: "Janvier", montant: 1200 },
    { client: "BETA", mois: "Janvier", montant: 850 }
  ]
};
```

---

## ✅ À venir (roadmap)

- 🔍 Filtres croisés intelligents
- 💡 Assistant de création de modèle
- 📊 Graphiques dynamiques ECharts
- 🔐 Authentification utilisateur

---

## 👨‍💻 Auteur

Projet développé par **Gaël**, chef de projet IT passionné d'ergonomie, productivité et données structurées.

---

## 📃 Licence

MIT – libre d'utilisation, de modification et de distribution.
