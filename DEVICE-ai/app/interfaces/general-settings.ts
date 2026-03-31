export interface GeneralSettings {
  storeData: boolean;
  dateTime: number;
  pinPhVcc: number;
  pinPhGnd: number;
  pinTVcc: number;
  pinTGnd: number;
  pinEcVcc: number;
  pinEcGnd: number;
  nightModeOn: string; // HH:mm of the day when night starts
  nightModeOff: string; // HH:mm of the day when night ends
  workMode: number;
  enabled: boolean;
  deleted: boolean;
  lastUpdate: number;
}

// WORK_MODE_FULL = 5;			|	D	vents on, 	pumps on, 	sensors on 		N 		vents on, 	pumps on, 	sensors on
// WORK_MODE_ON = 4;			|	D	vents on, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on
// WORK_MODE_SILENT = 3;		| 	D	vents off, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on
// WORK_MODE_SUPER_SILENT = 2;	| 	D	vents off, 	pumps off,	sensors on 		N 		vents off, 	pumps off,	sensors on
// WORK_MODE_OFF = 1;			| 	D	vents off, 	pumps off,	sensors off 	N 		vents off, 	pumps off,	sensors off
