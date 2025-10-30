export interface IDBSettings {
    host: string
    port: number
    user: string
    password: string
    database: string
}

const GetDBSettings = (): IDBSettings => {
    return {
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'bookescape',
        password: ''
        }
}

export default GetDBSettings;




