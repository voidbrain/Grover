import { Company } from './company';

export interface Strain {
	name			: string;
	lineage			: string;
	percent_sativa	: number;
	company			: Company[]
	abilitato		: number;
	last_update		: number;
	cancellato		: number;
}
