# ABESS VPN Mobile

Application mobile d’administration du panel **ABESS VPN**.

## Stack
- Expo SDK 58
- React Native 0.88
- TypeScript
- Expo Router
- Expo SecureStore pour conserver la session

## Fonctionnalités déjà posées
- Connexion avec les comptes du panel
- Support du code 2FA
- Session Bearer stockée dans SecureStore
- Dashboard mobile
- Liste des clients SSH-WSS
- Liste des revendeurs
- Écran Serveurs
- Navigation par onglets

## Backend
L’application consomme directement l’API du dépôt :
`abesskamer237/AbessVpn-Server-Panel`

Créer un fichier `.env` à partir de `.env.example` :

```env
EXPO_PUBLIC_API_BASE_URL=https://votre-domaine-panel.tld
```

## Lancer le projet
```bash
npm install
npx expo install --fix
npm start
```

## Prochaines étapes
- Création de clients SSH-WSS depuis l’app
- Nom d’utilisateur et mot de passe lors de la création
- Renouvellement, suspension et suppression
- Création et gestion des sous-revendeurs
- Recharge et récupération de crédits
- Dashboard complet et statistiques
- Supervision VPS et nœuds
- Transactions et historique
- Notifications
- Biométrie/PIN local en option
