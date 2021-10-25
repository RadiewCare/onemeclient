# One-Me powered by Radiewcare

## Setup for local development

One-Me:

1. Install node
2. Install Angular `npm i -g @angular/cli`
3. Install Ionic `npm i -g @ionic/cli`
4. Clone repository [https://github.com/BraunMarketing/one-me](https://github.com/BraunMarketing/one-me)
4. Move to the project folder
5. `npm install`

API:
1. Move to "functions" folder inside One-Me project
2. `npm install`

## Deploy One-Me on production server

In the project folder:

1. Compile `ionic build --prod`
2. Export to .tar file the static files `tar -cvf ./deploy.tar --exclude='*.map' ./captain-definition ./www/*` more info: [https://caprover.com/docs/recipe-deploy-create-react-app.html](https://caprover.com/docs/recipe-deploy-create-react-app.html)
3. Open on Caprover server (Infokernel) [https://captain.radiewcare-apps.es/](https://captain.radiewcare-apps.es/)
4. Deploy on one-me-client (deployment section, method 2)

## Deploy API on Firebase Cloud Functions

1. Install firebase tools `npm install -g firebase-tools`
2. Login as braunmarketingandconsulting@gmail.com with the command `firebase login` and config as Radiewcare project more info: [https://firebase.google.com/docs/cli](https://firebase.google.com/docs/cli)
3. Execute command `firebase deploy --only functions`