export interface User {
	userid: string // must be unique
	firstname: string, // must not be null
	lastname: string // must not be null
	email: string // must be unique and must not be null
	password: string // must not be null
	phone: string
}