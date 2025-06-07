
// Définition des données sources
const wsData = {
  data: [
    { client: "A", produit: "X", mois: "Janvier", montant: 100 },
    { client: "A", produit: "Y", mois: "Janvier", montant: 150 },
    { client: "B", produit: "X", mois: "Février", montant: 120 },
    { client: "B", produit: "Y", mois: "Janvier", montant: 80 },
    { client: "A", produit: "X", mois: "Janvier", montant: 200 }
  ]
};

// Variables globales
let models = [];
let rowFields = [], colFields = [], valFields = [], currentModel = null;

// Génère un champ draggable
function makeDraggableField(name) {
  const span = document.createElement('span');
  span.className = 'draggable';
  span.draggable = true;
  span.textContent = name;
  span.dataset.name = name;
  span.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', name));
  return span;
}

// Initialisation du drag & drop
function initDragDrop() {
  const zones = {
    rowZone: rowFields,
    colZone: colFields,
    valZone: valFields
  };

  Object.keys(zones).forEach(zoneId => {
    const zone = document.getElementById(zoneId);
    zone.ondragover = e => e.preventDefault();
    zone.ondrop = e => {
      e.preventDefault();
      const name = e.dataTransfer.getData('text/plain');

      if (zoneId === 'valZone') {
        const config = { field: name, func: 'sum' };
        valFields.push(config);
        const container = document.createElement('div');
        container.className = 'valConfig';
        container.innerHTML = `${name} <select onchange="this.parentNode.dataset.func=this.value"><option>sum</option><option>avg</option><option>count</option></select>`;
        container.dataset.field = name;
        container.dataset.func = 'sum';
        zone.appendChild(container);
      } else {
        if (!zones[zoneId].includes(name)) zones[zoneId].push(name);
        zone.appendChild(makeDraggableField(name));
      }
    };
  });
}

// Affiche les champs + filtres
function populateFieldSelector() {
  const selector = document.getElementById('fieldSelector');
  selector.innerHTML = '';
  Object.keys(wsData.data[0]).forEach(k => selector.appendChild(makeDraggableField(k)));
  const filterPanel = document.getElementById('filterPanel');
  filterPanel.innerHTML = '';
  Object.keys(wsData.data[0]).forEach(key => {
    const values = [...new Set(wsData.data.map(d => d[key]))];
    const label = document.createElement('label');
    label.textContent = key;
    const select = document.createElement('select');
    select.dataset.key = key;
    select.innerHTML = '<option value="">(Tous)</option>' + values.map(v => `<option value="${v}">${v}</option>`).join('');
    filterPanel.appendChild(label);
    filterPanel.appendChild(select);
  });
}

function getFilteredData() {
  const filters = Array.from(document.querySelectorAll('#filterPanel select'));
  return wsData.data.filter(row => {
    return filters.every(select => {
      const val = select.value;
      return !val || row[select.dataset.key] == val;
    });
  });
}

function aggregate(values, func) {
  switch(func) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'avg': return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
    case 'count': return values.length;
    default: return '';
  }
}

function groupKey(obj, fields) {
  return fields.map(f => obj[f]).join('|');
}

function renderCube() {
  const data = getFilteredData();
  if (!rowFields.length || !colFields.length || !valFields.length) return alert("Sélection incomplète");
  const rowKeys = [...new Set(data.map(d => groupKey(d, rowFields)))];
  const colKeys = [...new Set(data.map(d => groupKey(d, colFields)))];
  const table = document.createElement('table');
  const thead = table.insertRow();
  thead.insertCell().outerHTML = `<th>${rowFields.join('+')} \ ${colFields.join('+')}</th>`;
  colKeys.forEach(c => valFields.forEach(v => thead.insertCell().outerHTML = `<th>${c} (${v.field}/${v.func})</th>`));

  rowKeys.forEach(rKey => {
    const tr = table.insertRow();
    tr.insertCell().textContent = rKey;
    colKeys.forEach(cKey => {
      valFields.forEach(v => {
        const matches = data.filter(d => groupKey(d, rowFields) === rKey && groupKey(d, colFields) === cKey);
        const values = matches.map(m => parseFloat(m[v.field]) || 0);
        tr.insertCell().textContent = aggregate(values, v.func);
      });
    });
  });
  document.getElementById('cubeContainer').innerHTML = '';
  document.getElementById('cubeContainer').appendChild(table);
}

function exportCSV() {
  const table = document.querySelector('#cubeContainer table');
  if (!table) return;
  let csv = '';
  for (let row of table.rows) {
    csv += [...row.cells].map(td => '"' + td.textContent + '"').join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cube.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function resetZones() {
  rowFields = [];
  colFields = [];
  valFields = [];
  ['rowZone', 'colZone', 'valZone'].forEach(id => document.getElementById(id).innerHTML = id === 'valZone' ? 'Valeurs' : id === 'rowZone' ? 'Lignes' : 'Colonnes');
}

function addModel() {
  const name = prompt('Nom du modèle ?');
  if (!name) return;
  const filters = Array.from(document.querySelectorAll('#filterPanel select')).reduce((acc, sel) => { acc[sel.dataset.key] = sel.value; return acc; }, {});
  const valConf = Array.from(document.querySelectorAll('#valZone .valConfig')).map(div => ({ field: div.dataset.field, func: div.dataset.func }));
  models.push({ name, rowFields: [...rowFields], colFields: [...colFields], valFields: valConf, filters, __cube_type: true });
  updateModelList();
}

function updateModelList() {
  const list = document.getElementById('modelList');
  const query = document.getElementById('searchModel')?.value.toLowerCase() || '';
  list.innerHTML = '';
  const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));
  sorted.forEach((m, i) => { if (!m.name.toLowerCase().includes(query)) return;
    const div = document.createElement('div');
    div.innerHTML = `
      <input value="${m.name}" onchange="renameModel(${i}, this.value)">
      <button onclick="loadModel(${i})">🧲</button>
      <button onclick="duplicateModel(${i})">📄</button>
      <button onclick="deleteModel(${i})">🗑️</button>
    `;
    list.appendChild(div);
  });
}

function loadModel(i) {
  const model = models[i];
  resetZones();
  rowFields = [...model.rowFields];
  colFields = [...model.colFields];
  valFields = [...model.valFields];

  rowFields.forEach(f => document.getElementById('rowZone').appendChild(makeDraggableField(f)));
  colFields.forEach(f => document.getElementById('colZone').appendChild(makeDraggableField(f)));
  valFields.forEach(v => {
    const container = document.createElement('div');
    container.className = 'valConfig';
    container.dataset.field = v.field;
    container.dataset.func = v.func;
    container.innerHTML = `${v.field} <select onchange="this.parentNode.dataset.func=this.value"><option ${v.func === 'sum' ? 'selected' : ''}>sum</option><option ${v.func === 'avg' ? 'selected' : ''}>avg</option><option ${v.func === 'count' ? 'selected' : ''}>count</option></select>`;
    document.getElementById('valZone').appendChild(container);
  });

  Array.from(document.querySelectorAll('#filterPanel select')).forEach(sel => {
    sel.value = model.filters[sel.dataset.key] || '';
  });
}

function saveModel() {
  localStorage.setItem('cubeModels', JSON.stringify(models));
  alert('Modèles sauvegardés.');
}

function duplicateModel(i) {
  const copy = JSON.parse(JSON.stringify(models[i]));
  copy.name += ' (copie)';
  models.push(copy);
  updateModelList();
}

function deleteModel(i) {
  if (confirm('Supprimer ce modèle ?')) {
    models.splice(i, 1);
    updateModelList();
  }
}

function exportModels() {
  const blob = new Blob([JSON.stringify(models, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'models.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importModels(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        if (!confirm('Cette action ajoutera les modèles importés. Continuer ?')) return;

        imported.forEach(model => {
          if (!model.__cube_type) return;
          let baseName = model.name;
          let count = 1;
          while (models.some(m => m.name === model.name)) {
            model.name = `${baseName} (${count++})`;
          }
          models.push(model);
        });

        updateModelList();
        alert('Modèles importés avec succès.');
      } else throw 'Format invalide';
    } catch (err) {
      alert('Erreur d\'importation : format JSON non valide.');
    }
  };
  reader.readAsText(file);
}

function renameModel(index, newName) {
  models[index].name = newName;
  updateModelList();
}

window.onload = () => {
  const saved = localStorage.getItem('cubeModels');
  if (saved) models = JSON.parse(saved);
  updateModelList();
  populateFieldSelector();
  initDragDrop();
}
