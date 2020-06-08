import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class UsersService {
  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {}

  /**
   * Recoge todos los usuarios "sujetos" como observable
   */
  getUsers(): Observable<any> {
    return this.db.collection(`users`).valueChanges();
  }

  /**
   * Recoge todos los usuarios "sujetos"
   */
  getUsersData() {
    return this.db.firestore.collection(`users`).get();
  }

  /**
   * Recoge la información de un usuario como observable
   * @param id Identificador de usuario
   */
  getUser(id: string): Observable<any> {
    return this.db.doc(`users/${id}`).valueChanges();
  }

  /**
   * Recoge la información de un usuario como dato
   * @param id Identificador de usuario
   */
  getUserData(id: string): Promise<any> {
    return this.db.firestore.doc(`users/${id}`).get();
  }

  /**
   * Crea un usuario
   * @param data Datos del usuario
   */
  createUser(data: any): Promise<any> {
    data.createdAt = moment().format();
    return this.db
      .collection("users")
      .add(data)
      .then((doc) => {
        this.db.doc(`users/${doc.id}`).update({ id: doc.id });
      });
  }

  /**
   * Actualiza un usuario
   * @param id Identificador de usuario
   * @param data Datos del usuario
   */
  updateUser(id: string, data: any): Promise<any> {
    // TO DO: Actualizar dependencias

    data.updateAt = moment().format();
    return this.db.doc(`users/${id}`).update(data);
  }

  /**
   * Elmina un usuario
   * @param id Identificador de usuario
   */
  deleteUser(id: string): Promise<any> {
    // TO DO: Eliminar dependencias

    return this.db.doc(`users/${id}`).delete();
  }
}
