import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import * as firebase from "firebase/app";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  user$: Observable<any>;
  currentUser: any;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.db.doc(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Realiza el login en la aplicación devolviendo una promesa
   * @param email Email del usuario
   * @param password Password del usuario
   */
  emailSignIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Realiza el registro en la aplicación gurdando los datos del usuario en la base de datos y devolviendo una promesa
   * @param email Email del usuario
   * @param password Password del usuario
   */
  emailSignUp(email: string, password: string, data?: any, role?: string) {
    if (role && role === "doctor") {
      return this.afAuth
        .createUserWithEmailAndPassword(email, password)
        .then((credential) => {
          firebase.auth().currentUser.sendEmailVerification();
          return this.createDoctor(credential.user, data);
        });
    } else {
      return this.afAuth
        .createUserWithEmailAndPassword(email, password)
        .then((credential) => {
          firebase.auth().currentUser.sendEmailVerification();
          return this.createUser(credential.user, data);
        });
    }
  }

  /**
   * Crea un usuario en la base de datos procedente de formulario de registro
   * @param user Usuario de firebase
   * @param userName Nombre del usuario
   */
  private createUser(user: any, userData?: any) {
    if (userData) {
      const data = {
        id: user.uid,
        email: user.email,
        isSubject: true,
        isDoctor: false,
        language: userData.language,
        createdAt: moment().format()
      };
      return this.db.doc(`users/${user.uid}`).set(data);
    }
  }

  /**
   * Crea un doctor en la base de datos procedente de formulario de registro
   * @param user Usuario devuelto por Firebase
   * @param userData Datos del formulario restante
   */
  private createDoctor(user: any, userData?: any) {
    if (userData) {
      const data = {
        id: user.uid,
        email: user.email,
        isSubject: false,
        isDoctor: true,
        language: userData.language,
        createdAt: moment().format()
      };
      const doctorData = {
        id: user.uid,
        name: userData.name,
        isAdmin: false,
        isCollaborator: true,
        sharedSubjectsAnalytic: [],
        sharedSubjectsGenetic: [],
        sharedSubjectsReproduction: [],
        sharedSubjectsImage: [],
        sharedSubjectsPhenotypic: []
      };
      return this.db
        .doc(`users/${user.uid}`)
        .set(data)
        .then(() => {
          this.db.doc(`doctors/${user.uid}`).set(doctorData);
        });
    }
  }

  newCreateUser(userData: any) {
    if (userData) {
      return this.db
        .collection(`users`)
        .add(userData)
        .then((doc) => {
          this.db
            .doc(`users/${doc.id}`)
            .update({ id: doc.id, createdAt: moment().format() });
        })
        .catch(() => { });
    }
  }

  /**
   * Actualiza el usuario de la base de datos
   * @param user Usuario de firebase
   */
  private updateUser(user: any) {
    const data = {
      uid: user.uid,
      email: user.email,
      name: user.name
    };
    return this.db.doc(`users/${user.uid}`).update(data);
  }

  /**
   * Cierra la sesión del usuario y redirecciona a la pantalla de login
   */
  signOut() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(["/login"]);
    });
  }
}
