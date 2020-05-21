import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {throwError} from 'rxjs';
import {retry, catchError} from 'rxjs/operators';
import {NavController, ToastController} from '@ionic/angular';
import {auth} from 'firebase';
import 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class KisaKiDiService {
  url = 'https://kisa-ki-di-nrwbx72kza-ue.a.run.app';
  token: string;
  selectedUid: string;
  admin: boolean;
  constructor(
      private http: HttpClient,
      public toastController: ToastController,
      private ngFireAuth: AngularFireAuth,
      public navCtrl: NavController,
  ) { }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 4000
    });
    toast.present();
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

  authenticate() {
    this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth providers
  AuthLogin(provider) {
    return this.ngFireAuth.signInWithPopup(provider)
        .then((user) => {
          this.antre(user).subscribe((kont: any) => {
            this.token = kont.token;
            this.admin = kont.admin;
            this.selectedUid = kont.token;
            this.navCtrl.navigateRoot('/');
          });
        }).catch((error) => {
          this.presentToast('Nou pat ka idntifye w.');
          this.navCtrl.navigateRoot('/login');
        });
  }
}
