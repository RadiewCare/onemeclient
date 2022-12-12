import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowDiseaseDescriptionPage } from './show-disease-description.page';

describe('ShowDiseaseDescriptionPage', () => {
  let component: ShowDiseaseDescriptionPage;
  let fixture: ComponentFixture<ShowDiseaseDescriptionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowDiseaseDescriptionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowDiseaseDescriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
