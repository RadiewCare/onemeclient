import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditAnalyticStudyPage } from './edit-analytic-study.page';

describe('EditAnalyticStudyPage', () => {
  let component: EditAnalyticStudyPage;
  let fixture: ComponentFixture<EditAnalyticStudyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAnalyticStudyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditAnalyticStudyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
