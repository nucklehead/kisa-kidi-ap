import { Injectable } from '@angular/core';

const nouvoFonksyonalite = [
  {
    date: 1590019200, // Epoch in seconds: Thursday, May 21, 2020 12:00:00 AM
    image: 'delete.gif',
    title: 'Kounye a ou ka korije erè ou yo alèz.',
    texts: [
        'Li pi fasil pou efase, modifye ak chanje odyo ou make yo.',
    ]
  },
  {
    date: 1590019200, // Epoch in seconds: Thursday, May 21, 2020 12:00:00 AM
    image: 'view.gif',
    title: 'Kounye a ou ka avanse odyo pi devan.',
    texts: [
      'Ou ka afanse odyo a si ou pa vle rete koute l.',
      'Itilize dwet ou pou deplase odyo a',
    ]
  },
  {
    date: 1590019200, // Epoch in seconds: Thursday, May 21, 2020 12:00:00 AM
    image: 'cache.gif',
    title: 'Pagen pedi travay lè gen pwoblèm ankò.',
    texts: [
      'Travay ou a ap rete anrejistre sou telefòn ou a menm si ou soti.',
      'Pa bliye fòk ou toujou anrejistre travay la.',
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class NouvoFonksyonService {

  constructor() { }

  getUsersFeature(kont: any) {
    return nouvoFonksyonalite.filter(fonksyon => fonksyon.date > kont.latestFeature);
  }
}
