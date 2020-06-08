import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddImageTestPage } from './add-image-test.page';

describe('AddImageTestPage', () => {
  let component: AddImageTestPage;
  let fixture: ComponentFixture<AddImageTestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageTestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddImageTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
