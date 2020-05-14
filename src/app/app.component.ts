import {Component, OnInit} from '@angular/core';

import {NavController, Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {KisaKiDiService} from './api/kisa-ki-di.service';
import {Observable} from 'rxjs';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public chapitKiOuve = '';
  livYoAsync: Observable<any>;
  chapitYoAsync: Observable<any>;
  livKiOuve = '';

  nonProje = 'Liv bib la';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private kisaKiDiService: KisaKiDiService,
    private ngFireAuth: AngularFireAuth,
    public navCtrl: NavController,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.livYoAsync = this.kisaKiDiService.liv();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('/')[1];
    if (path !== undefined) {
      this.livKiOuve = path.split('/')[0];
      this.chapitKiOuve = path.split('/')[1];
    }
  }

  montreChapit(liv: any) {
    if (this.livKiOuve !== liv) {
      console.log('Openning');
      this.chapitYoAsync = this.kisaKiDiService.chapit(liv);
      this.livKiOuve = liv;
    } else {
      this.livKiOuve = '';
    }
  }

  logOut() {
    this.ngFireAuth.signOut().then(() => {
      this.kisaKiDiService.token = null;
      this.kisaKiDiService.admin = false;
      this.kisaKiDiService.selectedUid = null;
      this.navCtrl.navigateRoot('/login');
    });
  }
}
