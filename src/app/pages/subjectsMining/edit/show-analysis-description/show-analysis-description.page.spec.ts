import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShowAnalysisDescriptionPage } from './show-analysis-description.page';

describe('ShowAnalysisDescriptionPage', () => {
  let component: ShowAnalysisDescriptionPage;
  let fixture: ComponentFixture<ShowAnalysisDescriptionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowAnalysisDescriptionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShowAnalysisDescriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
