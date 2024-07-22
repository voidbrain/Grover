import { Strain } from './strain';
import { Calendarmantask } from './calendarmantask';

export interface Plant {
	id_strain				: number;
	strain					: Strain[];
	man_tasks				: Calendarmantask[];
	id_company				: number;
	id_growing_scenario		: number;
	id_growing_medium		: number;
	generation				: number;
	day_start_grow			: number;
	yeld					: number;
	alerts					: string;
	abilitato				: boolean;
	last_update				: number;
	cancellato				: boolean;

	calendar_macrotask_image: number;
    calendar_macrotask_date : number;
    tasks_class 			: string;
    tasks_alert 			: string;
    tasks_time 				: string;
    icon	 				: string;
}
