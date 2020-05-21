import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {retry, catchError} from 'rxjs/operators';
import {ModalController, NavController, ToastController} from '@ionic/angular';
import {auth} from 'firebase';
import 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/auth';
import { Plugins } from '@capacitor/core';
const { CapacitorDataStorageSqlite, Device } = Plugins;

import * as CDSSPlugin from 'capacitor-data-storage-sqlite';
import {NouvoFonksyonComponent} from '../modal/nouvo-fonksyon/nouvo-fonksyon.component';
import {NouvoFonksyonService} from '../fonksyon/nouvo-fonksyon.service';



@Injectable({
  providedIn: 'root'
})
export class KisaKiDiService {
  url = '';
  token: string;
  selectedUid: string;
  admin: boolean;
  storage: any;

  constructor(
      private http: HttpClient,
      public toastController: ToastController,
      private ngFireAuth: AngularFireAuth,
      public navCtrl: NavController,
      public modalController: ModalController,
      public nouvoFonksyonService: NouvoFonksyonService,
  ) { }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 4000
    });
    await toast.present();
  }

  // Handle API errors
  handleError(me: KisaKiDiService): (error: HttpErrorResponse) => any {
    return (error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.log('An error occurred:', error.error.message);
        me.presentToast('Sa pa mache. Tcheke entènèt ou.');
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.log(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        me.presentToast('Eskize n, sa pa mache, reeseye.');
      }
      // return an observable with a user-facing error message
      return throwError(
          'Something bad happened; please try again later.');
    };
  }

  liv() {
    return this.http.get(`${this.url}/api/liv`)
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  chapit(liv) {
    return this.http.get(`${this.url}/api/${liv}/chapit`)
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  vese(liv, chapit) {
    return this.http.get(`${this.url}/api/${liv}/${chapit}/vese`)
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  waves(liv, chapit) {
    const userId = this.admin ? this.selectedUid : this.token;
    return this.http.get(`${this.url}/api/${liv}/${chapit}/${userId}/anrejistre`)
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  anrejistre(liv, chapit, waves) {
    const userId = this.admin ? this.selectedUid : this.token;
    return this.http.post(`${this.url}/api/${liv}/${chapit}/${userId}/anrejistre`, {waves})
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  antre(user) {
    return this.http.post(`${this.url}/api/antre`, {uid: user.user.uid, ...user.additionalUserInfo.profile})
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  itilizate() {
    return this.http.get(`${this.url}/api/itilizate/${this.token}`)
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  makeFonksyon(date: number) {
    return this.http.post(`${this.url}/api/kont/${this.token}`, {date})
        .pipe(
            retry(3),
            catchError(this.handleError(this))
        );
  }

  authenticate() {
    this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth providers
  AuthLogin(provider) {
    return this.ngFireAuth.signInWithPopup(provider)
        .then((user) => {
          this.antre(user).subscribe((kont: any) => {
            this.token = kont.token;
            // this.admin = kont.admin;
            this.admin = false;
            this.selectedUid = kont.token;
            this.showNewFeatures(kont);
          });
        }).catch((error) => {
          this.presentToast('Nou pat ka idntifye w.');
          this.navCtrl.navigateRoot('/login');
        });
  }

  async showNewFeatures(kont: any) {
    const modal = await this.modalController.create({
      component: NouvoFonksyonComponent,
      componentProps: kont,
    });
    if (this.nouvoFonksyonService.getUsersFeature(kont).length > 0) {
      return await modal.present();
    } else {
      await this.navCtrl.navigateRoot('/');
    }
  }

//  Storage related methods. Move to its own service

  async initStorage() {
    const info =  await Device.getInfo();
    if (info.platform === 'ios' || info.platform === 'android') {
      this.storage = CapacitorDataStorageSqlite;
    } else if (info.platform === 'electron') {
      this.storage = CDSSPlugin.CapacitorDataStorageSqliteElectron;
    } else {
      this.storage = CDSSPlugin.CapacitorDataStorageSqlite;
    }
    const resOpen = await this.storage.openStore({});
    if (resOpen) {
      console.log('Storage is open');
    }
  }

  async setInStorage(liv, chapit, waves) {
    await this.storage.set({
      key: `${liv}-${chapit}`,
      value: JSON.stringify(waves)
    });
  }

  async getFromStorage(liv, chapit) {
    const ret = await this.storage.get({ key: `${liv}-${chapit}` });
    return JSON.parse(ret.value);
  }

  async removeFromStorage(liv, chapit) {
    await this.storage.remove({ key: `${liv}-${chapit}` });
  }
}
