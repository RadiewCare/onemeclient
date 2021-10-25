import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ClinicsPage } from './clinics.page';

describe('ClinicsPage', () => {
  let component: ClinicsPage;
  let fixture: ComponentFixture<ClinicsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
