
/// <reference path="java.d.ts" />

declare namespace org.apache.commons.io {
	export class IOUtils {
		static toString(input:java.io.InputStream, encoding:string): byte[];
	}
}