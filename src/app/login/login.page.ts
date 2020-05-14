import { Component, OnInit } from '@angular/core';
import {KisaKiDiService} from '../api/kisa-ki-di.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
      private kisaKiDiService: KisaKiDiService
  ) { }

  ngOnInit() {
  }

  authenticate() {
    this.kisaKiDiService.authenticate();
  }
}
