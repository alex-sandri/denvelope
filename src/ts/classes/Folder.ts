import { Config } from "../config/Config";
import Database from "./Database";
import Auth from "../scripts/Auth";

export default class Folder
{
	public static Create (data: Config.Data.Folder)
	{
		return Database.Add(`users/${Auth.UserId}/folders`, data);
	}

	public static Retrieve (id: string)
	{
		return <Promise<Config.Data.Folder | undefined>>Database.Retrieve(`users/${Auth.UserId}/folders`, id);
	}

	public static Update (id: string, data: Config.Data.FolderUpdate)
	{
		return Database.Update(`users/${Auth.UserId}/folders`, id, data);
	}

	public static Delete (id: string)
	{
		return Database.Delete(`users/${Auth.UserId}/folders`, id);
	}
}