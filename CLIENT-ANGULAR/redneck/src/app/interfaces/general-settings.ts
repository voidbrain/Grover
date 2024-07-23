export interface Settings {
	store_data 					: boolean,
	date_time 					: number;
	pin_ph_vcc 					: number;
    pin_ph_gnd 					: number;
    pin_t_vcc 					: number;
    pin_t_gnd 					: number;
    pin_ec_vcc 					: number;
    pin_ec_gnd 					: number;
    night_mode_on 				: string, // HH:mm of the day when night starts 
    night_mode_off 				: string, // HH:mm of the day when night ends
    work_mode 					: number;
    enabled                     : boolean;
    deleted                     : boolean;
    lastUpdate                  : number; 
}

// WORK_MODE_FULL = 5;			|	D	vents on, 	pumps on, 	sensors on 		N 		vents on, 	pumps on, 	sensors on 
// WORK_MODE_ON = 4;			|	D	vents on, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on 
// WORK_MODE_SILENT = 3;		| 	D	vents off, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on 
// WORK_MODE_SUPER_SILENT = 2;	| 	D	vents off, 	pumps off,	sensors on 		N 		vents off, 	pumps off,	sensors on 
// WORK_MODE_OFF = 1;			| 	D	vents off, 	pumps off,	sensors off 	N 		vents off, 	pumps off,	sensors off
