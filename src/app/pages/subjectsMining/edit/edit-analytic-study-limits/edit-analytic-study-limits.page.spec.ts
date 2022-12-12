import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditAnalyticStudyLimitsPage } from './edit-analytic-study-limits.page';

describe('EditAnalyticStudyLimitsPage', () => {
  let component: EditAnalyticStudyLimitsPage;
  let fixture: ComponentFixture<EditAnalyticStudyLimitsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAnalyticStudyLimitsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditAnalyticStudyLimitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
