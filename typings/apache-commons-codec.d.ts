// org.apache.commons.codec.binary.Base64

declare type byte = number;

declare namespace org.apache.commons.codec.binary {
	export class Base64 {
		static decodeBase64(input: string): byte[];
		static encodeBase64String(byte: byte[]): string;
		static encodeBase64(byte: byte[]): byte[];
	}

	export class StringUtils {
		static getBytesUtf8(value: string): byte[]; 
	}
}

declare namespace org.apache.commons.codec.digest {
	export class DigestUtils {
		sha1(data: byte[]): byte[];
		sha256Hex(data: byte[] | string): string;
		static md5Hex(data: string): string;
	}
}

declare namespace org.apache.commons.codec.net {
	export class BCodec {
		constructor(charset: string);
		encode(value: string): string;

	}
}