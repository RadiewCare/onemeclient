import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PolymorphismsPage } from './polymorphisms.page';

describe('PolymorphismsPage', () => {
  let component: PolymorphismsPage;
  let fixture: ComponentFixture<PolymorphismsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolymorphismsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PolymorphismsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
