import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import WaveSurfer from 'wavesurfer.js';
import {KisaKiDiService} from '../api/kisa-ki-di.service';
import {Observable} from 'rxjs';
import {IonFab, NavController} from '@ionic/angular';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from 'firebase';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit, AfterViewInit {
  public liv: string;
  public chapit: string;

  url = '';
  progress = 0;
  duration = 0;
  ready = false;
  paused = true;
  playingCard = false;
  playingIndexCard = -1;

  waves = [];
  currentWave = this.waves[0];

  @ViewChild('waveform', {static: true}) waveformView: ElementRef;
  @ViewChildren('waveText', {read: ElementRef}) waveTextsView: QueryList<ElementRef>;
  @ViewChildren('waveOptions') waveOptionsView: QueryList<IonFab>;
  @ViewChild('addButton', {static: false, read: ElementRef}) addButtonView: ElementRef;
  waveSurfer: WaveSurfer;
  veseYoAsync: Observable<any>;
  usersAsync: Observable<any>;

  constructor(
      private activatedRoute: ActivatedRoute,
      private cd: ChangeDetectorRef,
      public kisaKiDiService: KisaKiDiService,
      private ngFireAuth: AngularFireAuth,
      public navCtrl: NavController,
  ) {
    this.ngFireAuth.authState.subscribe((user: User) => {
      if (!user) {
        this.navCtrl.navigateRoot('/login');
        return;
      }
      // check service token and all if not set call login
      if (!this.kisaKiDiService.token) {
        this.kisaKiDiService.authenticate();
      }
    });
  }

  ngOnInit() {
    this.liv = this.activatedRoute.snapshot.paramMap.get('liv');
    this.chapit = this.activatedRoute.snapshot.paramMap.get('chapit');
    this.url = `${this.kisaKiDiService.url}/api/${this.liv}/${this.chapit}/odyo.mp3`;
    this.veseYoAsync = this.kisaKiDiService.vese(this.liv, this.chapit);
    this.usersAsync = this.kisaKiDiService.itilizate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log(this.waveformView.nativeElement.clientWidth);
      console.log(this.waveformView.nativeElement.clientHeight);
      if (this.waveformView.nativeElement.clientWidth === 0) {
        return this.ngAfterViewInit();
      }

      this.waveSurfer = WaveSurfer.create({
        container: this.waveformView.nativeElement,
        responsive: true,
        backgroundColor: 'rgba(255,255,255,0.2)',
        height: this.waveformView.nativeElement.clientHeight
      });
      this.waveSurfer.load(this.url);
      this.waveSurfer.on('ready', () => {
        console.log('DOne');
        this.ready = true;
        this.duration = this.waveSurfer.getDuration();
        this.loadWaves();
        this.cd.detectChanges();
      });
      this.waveSurfer.on('audioprocess', () => {
        this.progress = this.waveSurfer.getCurrentTime();
        const limitWave = this.waves.find((wave) =>
            this.progress >= wave.startTime &&
            this.currentWave.startTime < wave.startTime);
        if (limitWave && !this.playingCard) {
          this.markWave();
          this.waveSurfer.seekTo(this.currentWave.startTime / this.duration);
        }
        this.cd.detectChanges();
      });
      this.waveSurfer.on('seek', (progress) => {
        const timeProgress = progress * this.duration;
        const limitWave = this.waves.find((wave) =>
            timeProgress > wave.startTime &&
            this.currentWave.startTime < wave.startTime);
        if (this.currentWave.startTime > timeProgress) {
          this.waveSurfer.seekTo(this.currentWave.startTime / this.duration);
        } else if (limitWave) {
          this.waveSurfer.seekTo(limitWave.startTime / this.duration);
        }
        this.progress = this.waveSurfer.getCurrentTime();
        this.cd.detectChanges();
      });
      this.waveSurfer.on('finish', () => {
        this.playingCard = false;
        this.playingIndexCard = -1;
        this.paused = !this.waveSurfer.isPlaying() && this.progress !== 0;
        this.cd.detectChanges();
      });
      this.waveSurfer.on('pause', () => {
        this.playingCard = false;
        this.playingIndexCard = -1;
        this.paused = !this.waveSurfer.isPlaying() && this.progress !== 0;
        this.cd.detectChanges();
      });

    }, 100);
  }

  playPause() {
    this.waveSurfer.playPause();
    this.paused = !this.waveSurfer.isPlaying() && this.progress !== 0;
    this.cd.detectChanges();
  }

  pause() {
    this.waveSurfer.pause();
    this.paused = true;
    this.cd.detectChanges();
  }

  stop() {
    this.waveSurfer.stop();
    this.playingCard = false;
    this.playingIndexCard = -1;
    this.waveSurfer.interact = true;
    this.paused = true;
    this.progress = this.waveSurfer.getCurrentTime();
    this.cd.detectChanges();
  }

  next() {}

  prev() {}

  // Add play vertical play for it or delete
  markWave() {
    this.pause();
    this.currentWave.endTime = this.progress;
    this.currentWave.marked = true;
    this.currentWave.accepted = false;
    this.currentWave.rejected = false;
    this.addNewWave();
  }

  private addNewWave() {
    this.currentWave = {
      startTime: this.waves[this.waves.length - 1].endTime,
      endTime: this.progress,
      marked: false,
      accepted: false,
      rejected: false,
    };
    this.waves.push(this.currentWave);
    this.cd.detectChanges();
  }

  buttonStylePosition() {
    return {
      left: `calc(${this.duration === 0 ? 0 : this.progress / this.duration * 100}% - 1.5rem)`
    };
  }

  highlighterStyle(wave: any) {
    // color = 'rgba(rgb(255, 63, 98), 0.3)';

    if (wave.marked) {
      return {
        width: (wave.endTime - wave.startTime) / this.duration * 100 + '%',
        left: wave.startTime / this.duration * 100 + '%'
      };
    }
    return {
      width: (this.progress - wave.startTime) / this.duration * 100 + '%',
      left: wave.startTime / this.duration * 100 + '%'
    };
  }

  removeWave(index: number) {
    this.waves[index].marked = false;
    this.currentWave  = this.waves.find((wave) => !wave.marked);
    this.waves.pop();
    this.waveSurfer.seekTo(this.currentWave.startTime / this.duration);
    this.cd.detectChanges();
  }

  waveOptions(index: number) {
    if (this.waves.length > index &&
        this.waves[index].marked &&
        !this.playingCard &&
        !this.waves[index].accepted) {
      const textView = this.waveTextsView.toArray()[index];
      textView.nativeElement.scrollIntoView(true);
      this.waveOptionsView.forEach((ionFab) => ionFab.close);
      const optionIndex = this.getOptionIndex(index);
      this.waveOptionsView.toArray()[optionIndex].activated = true;
    }
  }

  private getOptionIndex(index) {
    const waveToOpen = this.waves[index];
    return  this.waves.filter((wave) => wave.marked).findIndex((wave) => wave.startTime === waveToOpen.startTime);
  }

  marked(index: number) {
    return this.waves.length > index && this.waves[index].marked;
  }

  asIsOrder(a, b) {
    return 1;
  }

  playCard(index: number) {
    this.stop();
    this.waveSurfer.toggleInteraction();
    this.playingCard = true;
    this.playingIndexCard = index;
    this.waveSurfer.play(this.waves[index].startTime, this.waves[index].endTime);
    this.cd.detectChanges();
  }

  anrejistre() {
    this.kisaKiDiService.anrejistre(this.liv, this.chapit, this.waves).subscribe(() => {
      this.kisaKiDiService.presentToast('Tout bagay anrejistre.');
    });
  }

  canSave() {
    return this.waves.some((wave) => wave.marked);
  }

  reject(index: number) {
    this.waves[index].rejected = true;
    this.waves[index].accepted = false;
    this.cd.detectChanges();
  }

  accept(index: number) {
    this.waves[index].accepted = true;
    this.waves[index].rejected = false;
    this.cd.detectChanges();
    const optionIndex = this.getOptionIndex(index);
    this.waveOptionsView.toArray()[optionIndex].close().then(() => {
      console.log('Closed option for accepted wave.');
    });
  }

  accepted(index: number) {
    return this.waves[index].accepted;
  }

  cardColor(index: number) {
    switch (true) {
      case this.waves.length <= index:
        return '';
      case this.waves[index].accepted:
        return 'success';
      case this.waves[index].rejected:
        return 'danger';
      case this.marked(index):
        return 'dark';
      case true:
        return '';
    }
  }

  cardStyle(index: number) {
    switch (true) {
      case this.waves.length <= index:
        return {opacity: 1};
      case this.waves[index].accepted:
        return {opacity: 0.5};
      case this.waves[index].rejected:
      case this.marked(index):
      case true:
        return {opacity: 1};
    }
  }

  cardPlayColor(index: number) {
    switch (true) {
      case this.waves.length <= index:
        return 'primary';
      case this.waves[index].accepted:
        return 'secondary';
      case this.waves[index].rejected:
        return 'dark';
      case this.marked(index):
        return 'primary';
      case true:
        return 'primary';
    }
  }

  loadWaves() {
    this.kisaKiDiService.waves(this.liv, this.chapit).subscribe((waves: any) => {
      if (waves.length !== 0) {
        this.waves = waves;
      } else {
        this.waves = [{
          startTime: 0,
          endTime: 0,
          marked: false,
          accepted: false,
          rejected: false,
        }];
      }
      this.currentWave = this.waves.find((wave) => !wave.marked);
      this.waveSurfer.seekTo(this.currentWave.startTime / this.duration);
      this.addShadowToAddButton();
      this.cd.detectChanges();
    });
  }

  addShadowToAddButton() {
    if (!this.addButtonView) {
      console.log('addButtonView not ready');
      this.cd.detectChanges();
      return;
      // return this.addShadowToAddButton();
    }
    const cssRule = 'stroke: var(--ion-color-light) !important;' +
        'stroke-width: 1rem;' +
        'stroke-opacity: 1;';
    try {
      const sheet = new CSSStyleSheet();
      // To support Internet Explorer before version 9
      sheet.insertRule ? sheet.insertRule(`svg {${cssRule}}`) : sheet.addRule( `svg`, cssRule);
      this.addButtonView.nativeElement.shadowRoot.adoptedStyleSheets =
          this.addButtonView.nativeElement.shadowRoot.adoptedStyleSheets.concat([sheet]);
    } catch (e) {
      const style = document.createElement('style');
      style.innerHTML = `svg {${cssRule}}`;
      this.addButtonView.nativeElement.shadowRoot.appendChild(style);
    }
    this.cd.detectChanges();
  }

  compareWithFn = (user1, user2) => {
    return user1 && user2 ? user1.id === user2.id : user1 === user2;
  }

  changeUser() {
    this.veseYoAsync = this.kisaKiDiService.vese(this.liv, this.chapit);
    this.cd.detectChanges();
  }
}
