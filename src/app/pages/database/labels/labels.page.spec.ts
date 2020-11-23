import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LabelsPage } from './labels.page';

describe('LabelsPage', () => {
  let component: LabelsPage;
  let fixture: ComponentFixture<LabelsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LabelsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
