import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RadiologyPage } from './radiology.page';

describe('RadiologyPage', () => {
  let component: RadiologyPage;
  let fixture: ComponentFixture<RadiologyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiologyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RadiologyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
