import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddImageTestElementPage } from './add-image-test-element.page';

describe('AddImageTestElementPage', () => {
  let component: AddImageTestElementPage;
  let fixture: ComponentFixture<AddImageTestElementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageTestElementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddImageTestElementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
