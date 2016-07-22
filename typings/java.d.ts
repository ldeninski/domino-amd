declare namespace java {
	export namespace util {
		export class Vector<T> {
			constructor();
			constructor(c: any);
			constructor(initialCapacity: number);
			constructor(initialCapacity: number, capacityIncrement: number);

			add(e: T): boolean;
			add(index: number, element: T);
			addAll(c: any);
			addAll(index: number, c: any);
			capacity(): number;
			clear(): void;
			clone(): Vector<T>;
			//toArray(): any[];
			toArray(a: T[]): T[];
			toArray(): T[];
			size(): number;
			get(index: number): T;
		}

		export class Date {

		}

		export class String {
			constructor(s: any);
		}

		export interface AbstractMap<K, V> {
			get(key: K): V;
		}

		export module AbstractMap {
			export interface Entry<K, V> {

			}
		}
	}

	export namespace io {
		export class File {
			constructor(filePath: string);
			getCanonicalPath(): string;
			isFile(): boolean;
			getParentFile(): File;
			isDirectory(): boolean;
			getName(): string;
			exists(): boolean;
			getAbsolutePath(): string;
		}

		export module File {
			const separator: string;
		}

		export class PrintWriter {
			constructor(out: java.io.OutputStream, autoFlush?: boolean);
			print(o: any): void;
			println(o: any): void;
			write(o: any): void;
			close(): void;
			flush(): void;
		}

		export class OutputStreamWriter {
			constructor(out: java.io.OutputStream, encodding: string);
			write(o: any): void;
			close(): void;
			flush(): void;
		}

		export class OutputStream {

		}

		export class InputStream {

		}

		export class Reader {

		}

		export class Writer {

		}
	}

	export namespace net {
		export class URLEncoder {
			static encode(s: string, encodding?: string): string;
		}

		export class URLDecoder {
			static decode(s: string, encodding?: string): string;
		}

		export class URL {
			constructor(url: string);
			openStream(): java.io.InputStream;
		}
	}
}
