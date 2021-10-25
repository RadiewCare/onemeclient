import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";

@Injectable({
  providedIn: "root"
})
export class ToastService {
  constructor(private toastController: ToastController) { }

  /**
   * Muestra un mensaje como toast
   * @param type Tipo de mensaje
   * @param message Mensaje
   */
  async show(type: string, message: string) {
    const toast = await this.toastController.create({
      message,
      color: type,
    });

    if (type === "danger") {
      toast.buttons = [{
        text: 'Cerrar',
        role: 'cancel',
        handler: () => {
        }
      }]
    } else {
      toast.duration = 2000;
    }

    toast.present();
  }
}
