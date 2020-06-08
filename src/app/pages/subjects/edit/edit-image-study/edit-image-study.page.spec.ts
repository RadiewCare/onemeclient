import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditImageStudyPage } from './edit-image-study.page';

describe('EditImageStudyPage', () => {
  let component: EditImageStudyPage;
  let fixture: ComponentFixture<EditImageStudyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditImageStudyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditImageStudyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
