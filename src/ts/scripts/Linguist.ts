import Translation from "./Translation";
import FileIcons from "./FileIcons";
import FolderIcons from "./FolderIcons";
import { IsSet } from "./Utilities";

export default class Linguist
{
	public static Get = (lang : string) : any =>
		[
			...FileIcons.icons,
			FileIcons.defaultIcon,
			...FolderIcons.icons,
			FolderIcons.defaultIcon,
		].filter(icon => icon.name === lang)[0];

	public static GetDisplayName = (lang : string) : string =>
	{
		let displayName : string;

		switch (lang)
		{
			case "cloud_firestore_indexes":
			case "cloud_firestore_security_rules":
			case "document":
			case "file":
			case "folder":
			case "image":
				displayName = Translation.Get(`api->languages->${lang}`);
				break;
			default: displayName = Linguist.Get(lang).displayName; break;
		}

		return displayName;
	}

	public static Detect = (name : string, isFile : boolean) : string | string[] =>
	{
		let language : any;
		let languageSpecificity : number = -1;

		if (isFile)
		{
			// First search by file name
			[ language ] = FileIcons.icons.filter(lang => lang.fileNames?.includes(name));

			if (!IsSet(language)) FileIcons.icons
				.filter(lang => lang.fileExtensions?.filter(ext => name.endsWith(`.${ext}`)).length > 0)
				.forEach(lang =>
				{
					if (!IsSet(language)) language = lang;

					let maxExtensionSpecificity : number = -1;

					lang.fileExtensions.forEach(ext =>
					{
						const extensionSpecificity = ext.match(/\./g)?.length;

						if (extensionSpecificity > maxExtensionSpecificity) maxExtensionSpecificity
							= extensionSpecificity;
					});

					language.fileExtensions.forEach((ext : string) =>
					{
						const extensionSpecificity = ext.match(/\./g)?.length;

						if (extensionSpecificity > maxExtensionSpecificity) maxExtensionSpecificity
							= extensionSpecificity;
					});

					if (maxExtensionSpecificity > languageSpecificity)
					{
						language = lang;
						languageSpecificity = maxExtensionSpecificity;
					}
				});
		}
		else FolderIcons.icons
			.forEach(lang =>
			{
				if (lang.folderNames?.includes(name)) language = lang;
			});

		return IsSet(language) ? language.name : (isFile ? FileIcons : FolderIcons).defaultIcon.name;
	}
}