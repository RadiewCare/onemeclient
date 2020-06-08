import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddAnalyticStudyPage } from './add-analytic-study.page';

describe('AddAnalyticStudyPage', () => {
  let component: AddAnalyticStudyPage;
  let fixture: ComponentFixture<AddAnalyticStudyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAnalyticStudyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddAnalyticStudyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
