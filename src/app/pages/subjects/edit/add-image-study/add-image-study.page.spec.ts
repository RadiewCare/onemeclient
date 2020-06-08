import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddImageStudyPage } from './add-image-study.page';

describe('AddImageStudyPage', () => {
  let component: AddImageStudyPage;
  let fixture: ComponentFixture<AddImageStudyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageStudyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddImageStudyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
