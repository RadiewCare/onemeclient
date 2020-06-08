import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AnalysisElementsPage } from './analysis-elements.page';

describe('AnalysisElementsPage', () => {
  let component: AnalysisElementsPage;
  let fixture: ComponentFixture<AnalysisElementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalysisElementsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisElementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
