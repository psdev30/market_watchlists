import { Component, OnInit } from '@angular/core';
import { Ticker } from 'src/app/objects/ticker';
import { ApiService } from 'src/app/service/api.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { TransferService } from 'src/app/service/transfer.service';

@Component({
  selector: 'app-random',
  templateUrl: './random.component.html',
  styleUrls: ['./random.component.scss']
})
export class RandomComponent implements OnInit {
  ticker: string;
  results: any[] = [];
  random: string[] = []

  constructor(private api: ApiService, private db: AngularFireDatabase, private transferService: TransferService) { }

  ngOnInit() {
    this.transferService.refreshHoldingsClickedObservable$.subscribe(() => {
      this.random = []
      this.db.database.ref('/Random').once('value').then((resp) => {
        for (const key in resp.val())
          this.random.push(resp.val()[key])
        console.log(this.random)
        this.triggerGetRandom();
      });
    });


    this.transferService.getRandomObservable$.subscribe(() => {
      this.results = []
      for (var ticker of this.random) {
        this.api.getRandom(ticker).subscribe((quote: any) => {
          console.log(quote)
          let ticker: Ticker = new Ticker();
          ticker.name = quote.symbol;
          ticker.lastPrice = quote.latestPrice;
          ticker.change = quote.change;
          ticker.percentChange = quote.changePercent;

          if (ticker.change > 0) ticker.positive = true
          else ticker.positive = false;

          this.results.push(ticker)
        });
      }
    });
  }

  triggerGetRandom() {
    this.transferService.triggerGetRandom(true);
  }

  addToRandom(ticker: string) {
    this.db.database.ref('/Random').child(ticker).set(ticker)
    this.triggerRefresh();
  }

  removeFromRandom(ticker: string) {
    this.db.database.ref('/Random').child(ticker).remove()
    this.triggerRefresh();
  }

  removeAllRandom() {
    for (var random of this.random)
      this.db.database.ref('/Random').child(random).remove()
    this.triggerRefresh();
  }

  triggerRefresh() {
    this.transferService.triggerRandomRefresh(true)
  }

  setTicker($event: any) {
    this.ticker = $event;
    console.log(this.ticker)
  }

  resetModal() {
    this.ticker = '';
  }

  reset() {
    this.random = []
    this.results = [];
  }

  resetAddToHoldingsModal() {
    this.ticker = '';
  }

}
