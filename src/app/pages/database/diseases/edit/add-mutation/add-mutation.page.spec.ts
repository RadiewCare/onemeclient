import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddMutationPage } from './add-mutation.page';

describe('AddMutationPage', () => {
  let component: AddMutationPage;
  let fixture: ComponentFixture<AddMutationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMutationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddMutationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
