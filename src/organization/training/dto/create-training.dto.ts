export class CreateTrainingDto {
  title: string;
  description?: string;
  locationId?: string;
  disciplineId?: string;
  coachIds?: string[];
  teamIds?: string[];
  startsAt: string;
  endsAt: string;
  recurrenceRule?: string;
}
