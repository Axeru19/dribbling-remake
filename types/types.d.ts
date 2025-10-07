export type AppUser = {
  id?: string;
  name?: string | null;
  surname?: string | null;
  nickname?: string | null;
  password?: string | null;
  email?: string | null;
  nickname?: string | null;
  telephone?: string | null;
  role_id?: number | null;
};

export type ReservationPostRequest = {
  date?: Date;
  id_user?: number;
  id_field?: number;
  start_time?: string;
  end_time?: string;
  id_status?: number;
};
