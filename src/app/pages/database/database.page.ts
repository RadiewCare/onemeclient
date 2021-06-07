import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-database',
  templateUrl: './database.page.html',
  styleUrls: ['./database.page.scss'],
})
export class DatabasePage implements OnInit {
  user$: any;
  userData: any;
  userSub: Subscription;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe((data) => {
      this.userData = data;
    });
  }

}
