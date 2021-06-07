import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddAnalysisElementPage } from './add-analysis-element.page';

describe('AddAnalysisElementPage', () => {
  let component: AddAnalysisElementPage;
  let fixture: ComponentFixture<AddAnalysisElementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAnalysisElementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddAnalysisElementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
