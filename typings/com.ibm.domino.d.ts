/// <reference path="java.d.ts" />
/// <reference path="javax.d.ts" />

declare var session: NotesSession;
declare var sessionAsSigner: NotesSession;
declare var context;
declare var database: NotesDatabase;
declare function print(any);
declare var facesContext: com.ibm.xsp.domino.context.DominoFacesContext;
declare function toJson(o: any);
declare function fromJson(s: string): any;
declare var param: { [key: string]: any };

declare type int = number;
declare type double = number;

declare module com.ibm.xsp.domino.context {
	interface DominoFacesContext {
		getExternalContext(): DominoExternalContext;
	}

	interface DominoExternalContext {
		getResponse(): com.ibm.xsp.webapp.XspHttpServletResponse;
		getRequestHeaderMap(): java.util.AbstractMap<string, any>;
		getRequest(): javax.servlet.http.HttpServletRequest;
		getResourceAsStream(name: string): java.io.InputStream;
	}
}

declare module com.ibm.xsp.webapp {
	interface XspHttpServletResponse {
		getOutputStream(): java.io.OutputStream;
		getWriter(): java.io.PrintWriter;
		setContentType(ct: string);
		setHeader(header: string, value: string);
	}
}


declare interface NotesItem {
	getName(): string;
	getValueString(): string
	setValueString(value: string): void
	getValueInteger(): int
	setValueInteger(value: int): void
	getValueDouble(): double
	setValueDouble(value: double): void
	getType(): NotesItem.TYPE;
	getValues(): java.util.Vector<any>
	setValues(values: java.util.Vector<any>): void;
	setAuthors(b: boolean);
	setSummary(b: boolean);
}

declare module NotesItem {
	export const enum TYPE {
		UNKNOWN = 0,
		RICHTEXT = 1,
		COLLATION = 2,
		NOTEREFS = 4,
		ICON = 6,
		NOTELINKS = 7,
		SIGNATURE = 8,
		USERDATA = 14,
		QUERYCD = 15,
		ACTIONCD = 16,
		ASSISTANTINFO = 17,
		VIEWMAPDATA = 18,
		VIEWMAPLAYOUT = 19,
		LSOBJECT = 20,
		HTML = 21,
		MIME_PART = 25,
		ERRORITEM = 256,
		UNAVAILABLE = 512,
		NUMBERS = 768,
		DATETIMES = 1024,
		NAMES = 1074,
		READERS = 1075,
		AUTHORS = 1076,
		TEXT = 1280,
		RFC822TEXT = 1282,
		ATTACHMENT = 1084,
		OTHEROBJECT = 1085,
		EMBEDDEDOBJECT = 1090,
		FORMULA = 1536,
		USERID = 1792
	}
}

declare interface NotesACL {

}

declare module NotesACL {
	export const enum LEVEL {
		NOACCESS = 0,
		DEPOSITOR,
		READER,
		AUTHOR,
		EDITOR,
		DESIGNER,
		MANAGER
	}
}

declare interface NotesSession {
	createDateTime(date: string): NotesDateTime
	createDateTime(date: Date): NotesDateTime
	getEffectiveUserName(): string
	getDatabase(server: string, db: string): NotesDatabase
	getDatabase(server: string, db: string, createonfail: boolean): NotesDatabase
	createName(name: string): NotesName;
	verifyPassword(password: string, hash: string): boolean;
	hashPassword(password: string): string;
	getCurrentDatabase(): NotesDatabase;
	setConvertMime(b: boolean);
	createStream(): NotesStream;
}

declare interface NotesStream {
	write(buffer: byte[]): int;
	truncate(): void;
	close(): void;
	writeText(text: string): int
	writeText(text: string, endOfLine: int): int
	setContents(stream: java.io.InputStream): void
	setContents(stream: java.io.Reader): void
	readText(): string
	readText(oneLine: int): string
	readText(oneLine: int, endOfLine: int): string
	read(): byte[]
	read(length: int): byte[]
	open(pathname: string): boolean
	open(pathname: string, charset: string): boolean
	getContents(stream: java.io.OutputStream): void
	getContents(stream: java.io.Writer): void
	getPosition(): int
	setPosition(position: int): void
	isReadOnly(): boolean
	isEOS(): boolean
	getCharset(): string
	getBytes(): int
}

declare interface NotesName {
	getCanonical(): string;
	getCommon(): string;
	getAbbreviated(): string;
	getOrganization(): string;
}

declare interface NotesDateTime {
	toJavaDate(): Date
	timeDifferenceDouble(nd: NotesDateTime): double;
	getTimeZone(): int;
	getGMTTime(): string;
}

declare interface NotesView {
	getAllEntriesByKey(key: any): NotesViewEntryCollection
	getAllEntriesByKey(keys: java.util.Vector<any>): NotesViewEntryCollection
	getAllEntriesByKey(key: any, exact: boolean): NotesViewEntryCollection
	getAllEntriesByKey(keys: java.util.Vector<any>, exact: boolean): NotesViewEntryCollection
	getFirstDocument(): NotesDocument;
	getNthDocument(n: int): NotesDocument
	getNextDocument(doc: NotesDocument): NotesDocument;
	getEntryByKey(key: string, exactMatch: boolean): NotesViewEntry;
	refresh(): void;
	createViewNavFromCategory(category: string): NotesViewNavigator;
	getAllEntries(): NotesViewEntryCollection;
	FTSearchSorted(query: string): int
	FTSearchSorted(query: string, maxdocs: int): int
	FTSearchSorted(query: string, maxdocs: int, column: string): int
	FTSearchSorted(query: string, maxdocs: int, column: string, ascending: boolean, exact: boolean, variants: boolean, fuzzy: boolean): int
	FTSearchSorted(query: string, maxdocs: int, column: int): int
	FTSearchSorted(query: string, maxdocs: int, column: int, ascending: boolean, exact: boolean, variants: boolean, fuzzy: boolean): int
	FTSearchSorted(query: java.util.Vector<any>): int
	FTSearchSorted(query: java.util.Vector<any>, maxdocs: int): int
	FTSearchSorted(query: java.util.Vector<any>, maxdocs: int, column: string): int
	FTSearchSorted(query: java.util.Vector<any>, maxdocs: int, column: string, ascending: boolean, exact: boolean, variants: boolean, fuzzy: boolean): int
	FTSearchSorted(query: java.util.Vector<any>, maxdocs: int, column: int): int;
	FTSearchSorted(query: java.util.Vector<any>, maxdocs: int, column: int, ascending: boolean, exact: boolean, variants: boolean, fuzzy: boolean): int;
	FTSearch(query: string): int
	FTSearch(query: string, maxdocs: int): int;
	getEntryCount(): int;
	getColumns(): java.util.Vector<NotesViewColumn>;
	getDocumentByKey(key: any): NotesDocument;
	getDocumentByKey(keys: java.util.Vector<any>): NotesDocument;
	getDocumentByKey(key: any, exact: boolean): NotesDocument;
	getDocumentByKey(keys: java.util.Vector<any>, exact: boolean): NotesDocument;
}

declare interface NotesViewColumn {
	getItemName(): string;
	getTitle(): string;
	setTitle(title: string): void;
}

declare interface NotesViewEntry {
	isValid(): boolean;
	isDocument(): boolean;
	getDocument(): NotesDocument;
	getColumnValues(): java.util.Vector<any>;
	getUniversalID(): string;
	recycle(): void;
	getPosition(separator: string): string;
	getNoteID(): string;
	getSiblingCount(): int;
	getRead(username?: string): boolean;
	isPreferJavaDates(): boolean;
	setPreferJavaDates(boolean): void;
	getFTSearchScore(): int;
}

declare interface NotesViewEntryCollection {
	getNextEntry(): NotesViewEntry
	getNextEntry(entry: NotesViewEntry): NotesViewEntry
	getCount(): number;
	getNthEntry(n: number): NotesViewEntry;
	getFirstEntry(): NotesViewEntry;
}

declare interface NotesViewNavigator {
	getFirst(): NotesViewEntry;
	getCount(): number;
}

declare interface NotesDocument {
	getItemValueString(itemName: string): string;
	getItemValueInteger(itemName: string): int;
	getItemValueDouble(itemName: string): double;
	getItemValue(name: string): java.util.Vector<any>;
	save(): boolean
	save(force: boolean): boolean
	save(force: boolean, makeresponse: boolean): boolean
	save(force: boolean, makeresponse: boolean, markread: boolean);
	copyToDatabase(db: NotesDatabase): NotesDocument
	copyItem(item: NotesItem): NotesItem
	copyItem(item: NotesItem, newname: string): NotesItem
	replaceItemValue(name: string, value: any): NotesItem
	getUniversalID(): string
	setUniversalID(unid: string): void
	copyAllItems(doc: NotesDocument, replace: boolean): void
	isNewNote(): boolean
	removeItem(name: string): void
	isValid(): boolean
	getItems(): java.util.Vector<NotesItem>
	makeResponse(doc: NotesDocument): void
	hasItem(name: string): boolean
	getParentDatabase(): NotesDatabase
	isDeleted(): boolean;
	getCreated(): NotesDateTime;
	getColumnValues(): java.util.Vector<any>;
	recycle(): void;
	getParentDocumentUNID(): string;
	createRichTextItem(name: string): NotesRichTextItem;
	getFirstItem(name: string): NotesItem;
	setSaveMessageOnSend(save: boolean): void;
	createMIMEEntity(): NotesMIMEEntity;
	closeMIMEEntities(): boolean;
	closeMIMEEntities(savechanges: boolean): boolean;
	closeMIMEEntities(savechanges: boolean, entityitemname: string): boolean;
	send(): void
	send(recipient: string): void;
	send(recipients: java.util.Vector<string>): void;
	send(attachform: boolean): void;
	send(attachform: boolean, recipient: string): void;
	send(attachform: boolean, recipients: java.util.Vector<string>): void;
	getAttachment(filename: string): NotesEmbeddedObject;
	getMIMEEntity(): NotesMIMEEntity;
	getMIMEEntity(itemName: string): NotesMIMEEntity;
}

declare interface NotesEmbeddedObject {
	getInputStream(): java.io.InputStream;
	recycle(): void;
}

declare interface NotesMIMEEntity {
	createHeader(headerName: string): NotesMIMEHeader;
	createChildEntity(): NotesMIMEEntity;
	createChildEntity(nextSibling: NotesMIMEEntity): NotesMIMEEntity;
	setContentFromBytes(stream: NotesStream, contentType: string, encoding: NotesMIMEEntity.ENCODING): void;
	getPreamble(): string;
	setPreamble(preamble: string): void;
	getNthHeader(headerName: string): NotesMIMEHeader;
	getNthHeader(headerName: string, instance: int): NotesMIMEHeader;

}
declare module NotesMIMEEntity {
	export const enum ENCODING {
		BASE64 = 1727,			// -- Content-Transfer-Encoding is "base64"
		EXTENSION = 1731,		// -- Content-Transfer-Encoding is user-defined
		IDENTITY_7BIT = 1728,	// -- Content-Transfer-Encoding is "7bit"
		IDENTITY_8BIT = 1729,	// -- Content-Transfer-Encoding is "8bit"
		IDENTITY_BINARY = 1730,	// -- Content-Transfer-Encoding is "binary"
		NONE = 1725,			// -- no Content-Transfer-Encoding header
		QUOTED_PRINTABLE = 1726	// -- Content-Transfer-Encoding is "quoted-printable"
	}
}

declare interface NotesMIMEHeader {
	addValText(valueText: string): boolean;
	addValText(valueText: string, charSet: string): boolean;
	setHeaderVal(headerValue: string): boolean;
	setHeaderValAndParams(headerParamValue: string): boolean;
	setParamVal(parameterName: string, parameterValue: string): boolean
}

declare interface NotesRichTextItem extends NotesItem {
	getUnformattedText(): string;
}

declare interface NotesDocumentCollection {

}

declare interface String {
	compareToIgnoreCase(p1: string): boolean;
	endsWith(p1: string): boolean;
	startsWith(p1: string): boolean;
}

declare interface NotesDatabase {
	getACL(): any;
	getACLActivityLog(): any;
	getAgents(): any;
	getAllDocuments(): any;
	getCategories(): any;
	getCreated(): any;
	getCurrentAccessLevel(): any;
	getDesignTemplateName(): any;
	getFileFormat(): any;
	getFileName(): any;
	getFilePath(): any;
	getFolderReferencesEnabled(): any;
	getForms(): any;
	getFTIndexFrequency(): any;
	getHttpURL(): any;
	IsAllowOpenSoftDeleted: any;
	isClusterReplication: any;
	isConfigurationDirectory: any;
	isCurrentAccessPublicReader: any;
	isCurrentAccessPublicWriter: any;
	isDB2: any;
	isDelayUpdates: any;
	isDesignLockingEnabled: any;
	isDirectoryCatalog: any;
	isDocumentLockingEnabled: any;
	isFTIndexed: any;
	isInMultiDbIndexing: any;
	isInService: any;
	isLink: any;
	isMultiDbSearch: any;
	isOpen(): any;
	isPendingDelete: any;
	isPrivateAddressBook: any;
	isPublicAddressBook: any;
	getLastFixup: any;
	getLastFTIndexed: any;
	getLastModified: any;
	getLimitRevisions: any;
	getLimitUpdatedBy: any;
	getListInDbCatalog: any;
	getManagers: any;
	getMaxSize: any;
	getNotesURL: any;
	getParent: any;
	getPercentUsed: any;
	getReplicaID: any;
	getReplicationInfo: any;
	getServer: any;
	getSize: any;
	getSizeQuota: any;
	getSizeWarning: any;
	getTemplateName: any;
	getTitle: any;
	getType: any;
	getUndeleteExpireTime: any;
	getViews: any;
	compact: any;
	compactWithOptions: any;
	createCopy: any;
	createDocument(): NotesDocument;
	createDocumentCollection: any;
	createFromTemplate: any;
	createFTIndex: any;
	createNoteCollection: any;
	createOutline: any;
	createQueryView: any;
	createReplica: any;
	createView: any;
	enableFolder: any;
	fixup: any;
	FTDomainSearch: any;
	FTSearch: any;
	FTSearchRange: any;
	getAgent: any;
	getAllReadDocuments: any;
	getAllUnreadDocuments: any;
	getDB2Schema: any;
	getDocumentByID: any;
	getDocumentByUNID: any;
	getDocumentByURL: any;
	getForm: any;
	getModifiedDocuments: any;
	getOption: any;
	getOutline: any;
	getProfileDocCollection: any;
	getProfileDocument: any;
	getURL: any;
	getURLHeaderInfo: any;
	getView(name: string): NotesView;
	grantAccess: any;
	markForDelete: any;
	open: any;
	openByReplicaID: any;
	openIfModified: any;
	openWithFailover: any;
	queryAccess(name: string): NotesACL.LEVEL;
	queryAccessPrivileges: any;
	queryAccessRoles: any;
	remove: any;
	removeFTIndex: any;
	replicate: any;
	revokeAccess: any;
	search: any;
	setOption: any;
	sign: any;
	updateFTIndex: any
}