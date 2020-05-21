import {Component, Input, OnInit} from '@angular/core';
import {NouvoFonksyonService} from '../../fonksyon/nouvo-fonksyon.service';
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {KisaKiDiService} from '../../api/kisa-ki-di.service';
import {ModalController, NavController} from '@ionic/angular';

@Component({
  selector: 'app-nouvo-fonksyon',
  templateUrl: './nouvo-fonksyon.component.html',
  styleUrls: ['./nouvo-fonksyon.component.scss'],
})
export class NouvoFonksyonComponent implements OnInit {
  @Input() latestFeature: string;
  fonksyonYo = [];

  constructor(
      public nouvoFonksyonService: NouvoFonksyonService,
      public kisaKiDiService: KisaKiDiService,
      public navCtrl: NavController,
      public modalController: ModalController,
  ) { }

  ngOnInit() {
    this.fonksyonYo = this.nouvoFonksyonService.getUsersFeature({latestFeature: this.latestFeature});
  }

  makeFonksyon() {
    const date = this.fonksyonYo.sort((f1, f2) => compareNumbers(f1.date, f2.date))[0].date;
    this.kisaKiDiService.makeFonksyon(date).subscribe(() => {
      console.log('Updated last seen feature');
      this.navCtrl.navigateRoot('/');
      this.modalController.dismiss();
    });
  }
}
