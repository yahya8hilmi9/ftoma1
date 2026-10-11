# Sécurité — Fatouma

## Déjà en place
- RLS activé sur toutes les tables; lecture publique limitée aux produits actifs.
- Commandes créées uniquement via `create_order()` (prix, livraison et stock recalculés côté serveur).
- Limite anti-spam: 3 commandes / heure / téléphone, 40 / 10 min au total (`backend/security-hardening.sql`).
- Champ piège (honeypot) anti-bots dans le checkout.
- Fonctions de trigger non appelables depuis l'API publique.
- Inscriptions publiques désactivées; création d'admin via Edge Function `create-admin` (vérifie que l'appelant est admin).
- Bibliothèque Supabase hébergée localement (`js/vendor/`), version figée: plus de script tiers exécuté sur le site.
- Content-Security-Policy (balise meta + `_headers` / `vercel.json`), headers HSTS, X-Frame-Options, nosniff.
- Textes venant de la base nettoyés avant affichage; URLs d'images / réseaux sociaux limitées à https.
- Admin: déconnexion auto après 30 min d'inactivité; export CSV protégé contre l'injection de formules.

## À faire à la main
- Activer "Leaked password protection" (plan Pro seulement).
- Utiliser un mot de passe long et unique pour chaque admin.
- Mettre le domaine final dans Supabase > Authentication > URL Configuration.
- Publier avec les en-têtes de `_headers` (Netlify / Cloudflare Pages) ou `vercel.json` (Vercel).
- Supprimer les commandes de test avant le lancement.
