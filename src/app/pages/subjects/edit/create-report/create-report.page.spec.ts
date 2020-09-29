import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CreateReportPage } from './create-report.page';

describe('CreateReportPage', () => {
  let component: CreateReportPage;
  let fixture: ComponentFixture<CreateReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
