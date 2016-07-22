declare namespace javax {
	export namespace servlet {
		export namespace http {
			export interface HttpServletRequest {
				getProtocol(): string;
				getQueryString(): string;
				getRequestURL(): string;
				getContextPath(): string;
				getServletPath(): string;
			}
		}

		export class ServletOutputStream {
			print(o: any): void;
			println(o: any): void;
		}
	}
}