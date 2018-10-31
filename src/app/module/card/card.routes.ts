import {CardComponent} from "./card.component";
import {CardUpdateComponent} from "./card-update.component";
export const routes = [
  {path: 'update', component: CardUpdateComponent},
  {path: 'update/:id', component: CardUpdateComponent},
  {path: ':queryType',component: CardComponent}
  // {path: ':queryType/:id',component: CardComponent}
];
