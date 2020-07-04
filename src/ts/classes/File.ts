import { Config } from "../config/Config";
import Database from "./Database";
import Auth from "../scripts/Auth";

export default class File
{
	public static Create (data: Config.Data.File)
	{
		return Database.Add(`users/${Auth.UserId}/files`, data);
	}

	public static Retrieve (id: string)
	{
		return <Promise<Config.Data.File | undefined>>Database.Retrieve(`users/${Auth.UserId}/files`, id);
	}

	public static Update (id: string, data: Config.Data.File)
	{
		return Database.Update(`users/${Auth.UserId}/files`, id, data);
	}

	public static Delete (id: string)
	{
		return Database.Delete(`users/${Auth.UserId}/files`, id);
	}
}