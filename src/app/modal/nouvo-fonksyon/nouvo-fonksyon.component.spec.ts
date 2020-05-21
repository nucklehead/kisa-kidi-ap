import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NouvoFonksyonComponent } from './nouvo-fonksyon.component';

describe('NouvoFonksyonComponent', () => {
  let component: NouvoFonksyonComponent;
  let fixture: ComponentFixture<NouvoFonksyonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NouvoFonksyonComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NouvoFonksyonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
