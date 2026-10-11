// Basic no-dependency smoke tests: node tests/smoke-test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sandbox = { window: {}, localStorage: { getItem(){return null;}, setItem(){} }, console };
vm.createContext(sandbox);
for (const file of ['js/data/config.js','js/data/catalog.js','js/store.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, {filename:file});
}
const F = sandbox.window.FATOUMA;
const assert = (condition, message) => { if (!condition) throw new Error('FAIL: ' + message); console.log('PASS: ' + message); };
assert(Array.isArray(F.items) && F.items.length > 0, 'catalogue chargé et contient des produits');
assert(F.items.every(p => p.id && p.ar && Number.isFinite(p.price) && p.price >= 0), 'chaque produit a ID, nom arabe et prix valide');
assert(F.byId('msemen') && F.byId('msemen').price === 4, 'recherche produit par ID');
assert(F.deliveryFee('city', 299) === 25, 'frais de livraison sous le seuil');
assert(F.deliveryFee('city', 300) === 0, 'livraison offerte au seuil de 300 DH');
F.cart.add('msemen', 2);
assert(F.cart.count() === 2, 'ajout et comptage des articles dans le panier');
assert(F.cart.subtotal() === 8, 'calcul du sous-total');
const msg = F.orderMessage({name:'Test Client',phone:'0612345678',city:'Casablanca',address:'Rue Test'}, 'city');
assert(msg.includes('Test Client') && msg.includes('8 د.م'), 'message de commande contient client et montant');
console.log('All smoke tests passed.');
